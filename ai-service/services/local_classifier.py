"""
本地 PyTorch 病虫害分类推理服务
使用训练好的 EfficientNet-B3 模型进行离线推理
作为 DeepSeek Vision API 的本地替代方案
"""
import io
import json
import logging
import os
from pathlib import Path
from typing import Optional

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms

from config import DATA_DIR, MODEL_CONFIDENCE_THRESHOLD

logger = logging.getLogger(__name__)

# 模型文件路径
_MODEL_DIR = Path(__file__).parent.parent / "models"
_MODEL_PATH = _MODEL_DIR / "pest_classifier_efficientnet_b3.pth"
_CLASS_MAPPING_PATH = _MODEL_DIR / "class_mapping.json"


class LocalTorchClassifier:
    """
    本地病虫害图像分类器
    使用 EfficientNet-B3 + ImageFolder 预训练权重
    支持 CPU/GPU 推理，返回与 ImageClassifier 兼容的结果格式
    """

    def __init__(self, model_path: Optional[str] = None):
        self._model = None
        self._class_mapping = None
        self._transform = None
        self._device = torch.device("cpu")  # 默认 CPU，避免 CUDA 兼容问题

        # 尝试 GPU
        try:
            if torch.cuda.is_available():
                self._device = torch.device("cuda")
                logger.info("使用 GPU 推理")
        except Exception:
            pass

        self._model_path = model_path or str(_MODEL_PATH)
        self._init_model()
        self._load_class_mapping()

        # 统计计数器
        self._total_predictions = 0
        self._unknown_count = 0

    # ==================== 初始化 ====================

    def _init_model(self):
        """加载训练好的模型"""
        if not os.path.exists(self._model_path):
            logger.warning(f"模型文件不存在: {self._model_path}，本地分类不可用")
            return

        try:
            from torchvision.models import efficientnet_b3
            import torch.nn as nn

            # 从 class_mapping 获取实际类别数
            num_classes = 52
            mapping_path = Path(_CLASS_MAPPING_PATH)
            if mapping_path.exists():
                with open(mapping_path, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                    num_classes = len(raw)

            # 构建与训练时完全相同的模型结构
            self._model = efficientnet_b3(num_classes=num_classes)
            in_features = self._model.classifier[1].in_features
            self._model.classifier = nn.Sequential(
                nn.Dropout(p=0.3),
                nn.Linear(in_features, 512),
                nn.ReLU(),
                nn.Dropout(p=0.15),
                nn.Linear(512, num_classes),
            )

            # 加载权重
            state_dict = torch.load(self._model_path, map_location=self._device)
            # 如果是 checkpoint 格式，提取 model_state_dict
            if "model_state_dict" in state_dict:
                state_dict = state_dict["model_state_dict"]
            # 移除可能的 backbone. 前缀（训练时使用了包装类）
            new_state_dict = {}
            for k, v in state_dict.items():
                if k.startswith("backbone."):
                    new_state_dict[k[9:]] = v  # 去掉 "backbone."
                else:
                    new_state_dict[k] = v
            self._model.load_state_dict(new_state_dict, strict=False)
            self._model.to(self._device)
            self._model.eval()

            # 预处理 transform
            self._transform = transforms.Compose([
                transforms.Resize((300, 300)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ])

            logger.info(f"本地分类器已加载: {self._model_path} (设备: {self._device})")

        except ImportError as e:
            logger.warning(f"缺少依赖，本地分类不可用: {e}")
        except Exception as e:
            logger.error(f"模型加载失败: {e}", exc_info=True)

    def _load_class_mapping(self):
        """加载类别 ID -> 病害信息映射"""
        self._class_mapping = {}
        mapping_path = Path(_CLASS_MAPPING_PATH)
        if mapping_path.exists():
            try:
                with open(mapping_path, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                    for key, info in raw.items():
                        self._class_mapping[info["id"]] = info
            except Exception as e:
                logger.warning(f"类别映射加载失败: {e}")

    # ==================== 知识库匹配 ====================

    def _load_knowledge_base(self) -> list:
        """加载病虫害知识库"""
        kb_path = os.path.join(DATA_DIR, "pest_knowledge_base.json")
        if os.path.exists(kb_path):
            try:
                with open(kb_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return []

    def _find_kb_entry(self, disease_name_cn: str) -> Optional[dict]:
        """匹配预测结果到知识库条目，获取防治方案"""
        kb = self._load_knowledge_base()
        for entry in kb:
            ename = entry.get("name", "")
            if ename in disease_name_cn or disease_name_cn in ename:
                return entry
        return None

    # ==================== 推理 ====================

    @property
    def is_available(self) -> bool:
        return self._model is not None

    def predict(
        self,
        image_bytes: bytes,
        filename: str = "unknown.jpg",
        crop_name: Optional[str] = None,
    ) -> dict:
        """
        对输入图片进行病虫害分类

        Args:
            image_bytes: 图片原始字节
            filename: 原始文件名
            crop_name: 可选作物名称，用于辅助验证结果

        Returns:
            dict: 与 ImageClassifier.predict() 兼容的结果格式
        """
        if not self.is_available:
            return self._unavailable_result("模型文件未找到，请先运行训练")

        try:
            # 预处理
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            tensor = self._transform(image).unsqueeze(0).to(self._device)

            # 推理
            with torch.no_grad():
                logits = self._model(tensor)
                probs = F.softmax(logits, dim=1)
                topk_probs, topk_indices = torch.topk(probs, min(5, probs.size(1)))

            top1_idx = topk_indices[0][0].item()
            top1_conf = topk_probs[0][0].item()

            # 查询类别信息
            class_info = self._class_mapping.get(top1_idx, {})
            disease_name = class_info.get("name_cn", f"类别{top1_idx}")
            scientific_name = class_info.get("scientific", "")
            severity = class_info.get("severity", "medium")

            # 作物验证：如果指定了作物但预测类别不匹配，降低置信度
            adjusted_conf = top1_conf
            if crop_name and class_info:
                predicted_crop = class_info.get("crop_cn", "")
                if predicted_crop and crop_name not in predicted_crop and predicted_crop not in crop_name:
                    adjusted_conf = top1_conf * 0.7  # 惩罚因子
                    logger.info(f"作物不匹配: 预测={predicted_crop}, 用户指定={crop_name}, "
                                f"原始置信度={top1_conf:.2f}, 调整后={adjusted_conf:.2f}")

            # 匹配知识库获取防治方案
            kb_entry = self._find_kb_entry(disease_name)

            # Top-K 备选
            alternatives = []
            for i in range(1, min(5, topk_indices.size(1))):
                alt_idx = topk_indices[0][i].item()
                alt_conf = topk_probs[0][i].item()
                alt_info = self._class_mapping.get(alt_idx, {})
                alternatives.append({
                    "diseaseName": alt_info.get("name_cn", f"类别{alt_idx}"),
                    "scientificName": alt_info.get("scientific", ""),
                    "confidence": round(float(alt_conf), 4),
                })

            # 判断是否为未知病害
            is_unknown = adjusted_conf < MODEL_CONFIDENCE_THRESHOLD

            result = {
                "diseaseName": f"疑似{disease_name}（待审核）" if is_unknown else disease_name,
                "scientificName": scientific_name,
                "confidence": round(adjusted_conf, 4),
                "severity": kb_entry.get("severity", severity) if kb_entry else severity,
                "symptoms": kb_entry.get("symptoms", "") if kb_entry else "",
                "treatment": {
                    "chemical": kb_entry.get("chemicalControl", []) if kb_entry else [],
                    "biological": kb_entry.get("biologicalControl", []) if kb_entry else [],
                    "agricultural": kb_entry.get("agriculturalControl", []) if kb_entry else [],
                } if kb_entry else {},
                "description": f"本地模型识别结果: {disease_name} (置信度 {adjusted_conf:.1%})",
                "knowledgeRefs": [kb_entry.get("id", "")] if kb_entry else [],
                "isUnknown": is_unknown,
                "modelUsed": "本地 EfficientNet-B3 v1.0",
                "alternatives": alternatives,
            }

            if is_unknown:
                result["message"] = "该病害置信度较低，已加入人工审核队列"

            # 更新统计
            self._total_predictions += 1
            if is_unknown:
                self._unknown_count += 1

            return result

        except Exception as e:
            logger.error(f"本地推理失败: {e}", exc_info=True)
            return self._unavailable_result(str(e))

    def _unavailable_result(self, error: str = "") -> dict:
        """模型不可用时的错误结果"""
        return {
            "diseaseName": "模型不可用",
            "scientificName": "",
            "confidence": 0.0,
            "severity": "low",
            "symptoms": "",
            "treatment": {},
            "description": f"本地模型推理失败: {error}" if error else "模型文件未找到",
            "knowledgeRefs": [],
            "isUnknown": True,
            "modelUsed": "本地模型（不可用）",
            "alternatives": [],
        }

    # ==================== 监控统计 ====================

    def get_stats(self) -> dict:
        """获取当前模型的运行统计"""
        unknown_rate = (
            self._unknown_count / self._total_predictions
            if self._total_predictions > 0
            else 0.0
        )
        return {
            "total_predictions": self._total_predictions,
            "unknown_count": self._unknown_count,
            "unknown_rate": round(unknown_rate, 4),
            "model_loaded": self.is_available,
            "device": str(self._device),
        }
