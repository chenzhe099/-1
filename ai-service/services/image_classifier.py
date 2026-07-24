"""
病虫害图像识别服务
使用 DeepSeek Vision API 进行病虫害识别，Mock 模式作为降级方案
"""
import json
import os
import hashlib
import base64
import random
import logging
from typing import Optional

from config import (
    DATA_DIR, MOCK_MODE, MODEL_CONFIDENCE_THRESHOLD,
    DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL, DEEPSEEK_TIMEOUT,
)

logger = logging.getLogger(__name__)

# 图片文件名关键词 -> 病害映射 (Mock模式降级用)
DISEASE_PATTERNS = {
    "late_blight": "番茄晚疫病",
    "powdery": "白粉病",
    "aphid": "蚜虫",
    "downy": "霜霉病",
    "blight": "晚疫病",
    "rust": "锈病",
    "mosaic": "花叶病毒病",
    "spot": "叶斑病",
    "rot": "软腐病",
    "wilt": "枯萎病",
    "tomato": "番茄晚疫病",
    "cucumber": "霜霉病",
    "pepper": "蚜虫",
    "strawberry": "白粉病",
    "eggplant": "枯萎病",
}


class ImageClassifier:
    """病虫害图像分类器 — DeepSeek Vision API 驱动"""

    def __init__(self):
        self._knowledge_base = self._load_knowledge_base()
        self._deepseek_client = None
        self._init_deepseek_client()

    # ==================== 初始化 ====================

    def _load_knowledge_base(self) -> list:
        """加载病虫害知识库"""
        kb_path = os.path.join(DATA_DIR, "pest_knowledge_base.json")
        if os.path.exists(kb_path):
            with open(kb_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def _init_deepseek_client(self):
        """初始化 DeepSeek 客户端 (OpenAI 兼容接口)"""
        if MOCK_MODE or not DEEPSEEK_API_KEY:
            logger.info("Mock 模式或未配置 API Key，使用本地规则引擎")
            return

        try:
            from openai import OpenAI
            self._deepseek_client = OpenAI(
                api_key=DEEPSEEK_API_KEY,
                base_url=DEEPSEEK_BASE_URL,
                timeout=DEEPSEEK_TIMEOUT,
            )
            logger.info(f"DeepSeek 客户端初始化成功，模型: {DEEPSEEK_MODEL}")
        except ImportError:
            logger.warning("openai 包未安装，回退到 Mock 模式")
        except Exception as e:
            logger.error(f"DeepSeek 客户端初始化失败: {e}")

    # ==================== 构建提示词 ====================

    def _build_knowledge_context(self) -> str:
        """将知识库转为提示词上下文"""
        if not self._knowledge_base:
            return ""

        lines = ["## 已知病害知识库 (共{}种)".format(len(self._knowledge_base))]
        for kb in self._knowledge_base:
            lines.append(f"""
### {kb.get('name', '')}
- 学名: {kb.get('scientificName', '')}
- 症状: {kb.get('symptoms', '')}
- 发病条件: {kb.get('causes', '')}
- 严重程度: {kb.get('severity', '')}
- 化学防治: {', '.join(kb.get('chemicalControl', []))}
- 生物防治: {', '.join(kb.get('biologicalControl', []))}
- 农业防治: {', '.join(kb.get('agriculturalControl', []))}
""")
        return "\n".join(lines)

    def _build_system_prompt(self, crop_name: Optional[str] = None) -> str:
        """构建系统提示词"""
        crop_hint = f"\n用户上报的作物类型为「{crop_name}」，请重点排查该作物的常见病害。" if crop_name else ""

        knowledge_context = self._build_knowledge_context()

        return f"""你是一个专业的农业病虫害诊断专家。我会给你一张作物叶片/茎/果实的病害图片，请仔细观察图片中的症状特征进行诊断。

{knowledge_context}

## 诊断要求
1. 仔细观察图片中的病斑颜色、形态、分布范围
2. 结合叶片的卷曲、枯萎、变色等特征
3. 注意是否有霉层、粉状物、虫体等可见迹象
4. 如果图片清晰度不足或特征不明显，请诚实说明并在 isUnknown 标记为 true{crop_hint}

## 返回格式要求
请严格按以下 JSON 格式返回（不要包含 markdown 代码块标记）：
{{
    "diseaseName": "病害中文名称，如不确定写疑似XX病",
    "scientificName": "拉丁学名",
    "confidence": 0.0-1.0之间的置信度数值,
    "severity": "low/medium/high/critical",
    "symptoms": "观察到的具体症状描述",
    "treatment": {{
        "chemical": ["化学防治建议1", "建议2"],
        "biological": ["生物防治建议1"],
        "agricultural": ["农业防治建议1", "建议2"]
    }},
    "description": "简要病情描述和建议",
    "isUnknown": false
}}

如果图片不是作物病害图片（是人、动物、风景等），请返回：
{{
    "diseaseName": "无法识别",
    "confidence": 0.0,
    "severity": "low",
    "symptoms": "",
    "treatment": {{}},
    "description": "请上传清晰的作物叶片、茎秆或果实的病害照片",
    "isUnknown": true
}}
"""

    # ==================== 图像 Base64 编码 ====================

    def _encode_image(self, image_bytes: bytes, filename: str = "unknown.jpg") -> str:
        """将图片字节转为 base64 data URL"""
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
        mime_map = {"jpg": "jpeg", "jpeg": "jpeg", "png": "png", "webp": "webp", "gif": "gif"}
        mime = mime_map.get(ext, "jpeg")
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        return f"data:image/{mime};base64,{b64}"

    # ==================== 核心推理 ====================

    def _call_deepseek(self, image_bytes: bytes, filename: str, crop_name: Optional[str] = None) -> dict:
        """调用 DeepSeek Vision API 进行病虫害识别"""
        system_prompt = self._build_system_prompt(crop_name)
        image_data_url = self._encode_image(image_bytes, filename)

        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": image_data_url},
                    },
                    {
                        "type": "text",
                        "text": f"请诊断这张图片中的作物病害{f'，当前作物为{crop_name}' if crop_name else ''}。直接返回JSON，不要包含```标记。",
                    },
                ],
            },
        ]

        try:
            response = self._deepseek_client.chat.completions.create(
                model=DEEPSEEK_MODEL,
                messages=messages,
                max_tokens=1024,
                temperature=0.2,  # 低温度保证结果稳定
            )
            raw_text = response.choices[0].message.content.strip()
            logger.info(f"DeepSeek 原始响应: {raw_text[:300]}...")
            return self._parse_response(raw_text, filename)

        except Exception as e:
            logger.error(f"DeepSeek API 调用失败: {e}")
            raise

    def _parse_response(self, raw_text: str, filename: str) -> dict:
        """解析 DeepSeek 返回的 JSON"""
        # 去除可能的 markdown 代码块标记
        text = raw_text.strip()
        if text.startswith("```"):
            # 去掉 ```json ... ``` 包装
            lines = text.split("\n")
            text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        try:
            result = json.loads(text)
        except json.JSONDecodeError:
            # 尝试提取 JSON 子串
            import re
            match = re.search(r"\{[\s\S]*\}", text)
            if match:
                try:
                    result = json.loads(match.group())
                except json.JSONDecodeError:
                    logger.warning(f"无法解析 DeepSeek 响应为JSON: {text[:200]}")
                    return self._mock_fallback(filename)
            else:
                logger.warning(f"响应中未发现JSON: {text[:200]}")
                return self._mock_fallback(filename)

        # 标准化字段
        return {
            "diseaseName": result.get("diseaseName", "未知病害"),
            "scientificName": result.get("scientificName", ""),
            "confidence": float(result.get("confidence", 0.5)),
            "severity": result.get("severity", "medium"),
            "symptoms": result.get("symptoms", ""),
            "treatment": {
                "chemical": result.get("treatment", {}).get("chemical", []),
                "biological": result.get("treatment", {}).get("biological", []),
                "agricultural": result.get("treatment", {}).get("agricultural", []),
            },
            "description": result.get("description", ""),
            "knowledgeRefs": [],
            "isUnknown": bool(result.get("isUnknown", False)),
        }

    # ==================== Mock 降级 ====================

    def _determine_disease(self, filename: str) -> tuple:
        """根据文件名确定病害 (Mock模式)"""
        filename_lower = filename.lower()
        for pattern, disease in DISEASE_PATTERNS.items():
            if pattern in filename_lower:
                return disease, 0.85 + random.uniform(0, 0.14)
        if self._knowledge_base:
            kb = random.choice(self._knowledge_base)
            return kb.get("name", "未知病害"), 0.65 + random.uniform(0, 0.15)
        return "未知病害", 0.3

    def _mock_fallback(self, filename: str) -> dict:
        """Mock 模式降级识别"""
        img_hash = hashlib.md5(filename.encode()).hexdigest()
        random.seed(img_hash)

        disease_name, confidence = self._determine_disease(filename)

        kb_entry = None
        for kb in self._knowledge_base:
            if kb.get("name") == disease_name:
                kb_entry = kb
                break
        if not kb_entry and self._knowledge_base:
            kb_entry = random.choice(self._knowledge_base)
            disease_name = kb_entry.get("name", disease_name)

        is_unknown = confidence < MODEL_CONFIDENCE_THRESHOLD
        result = {
            "diseaseName": f"疑似{disease_name}（待审核）" if is_unknown else disease_name,
            "scientificName": kb_entry.get("scientificName", "") if kb_entry else "",
            "confidence": round(confidence, 4),
            "severity": kb_entry.get("severity", "medium") if kb_entry else "low",
            "symptoms": kb_entry.get("symptoms", "") if kb_entry else "",
            "treatment": {
                "chemical": kb_entry.get("chemicalControl", []) if kb_entry else [],
                "biological": kb_entry.get("biologicalControl", []) if kb_entry else [],
                "agricultural": kb_entry.get("agriculturalControl", []) if kb_entry else [],
            } if kb_entry else {},
            "description": "",
            "knowledgeRefs": [kb_entry.get("id", "")] if kb_entry else [],
            "isUnknown": is_unknown,
        }
        if is_unknown:
            result["message"] = "该病害置信度较低，已加入人工审核队列"
        return result

    # ==================== 对外接口 ====================

    def predict(self, image_bytes: bytes, filename: str = "unknown.jpg",
                crop_name: Optional[str] = None) -> dict:
        """
        对输入图片进行病虫害识别

        Args:
            image_bytes: 图片字节数据
            filename: 原始文件名
            crop_name: 作物名称（可选，辅助提高识别精度）

        Returns:
            dict: 识别结果，包含病害名、置信度、防治方案等
        """
        # === 生产模式：调用 DeepSeek API ===
        if not MOCK_MODE and self._deepseek_client is not None:
            try:
                result = self._call_deepseek(image_bytes, filename, crop_name)
                # 低置信度标记为未知样本
                if result["confidence"] < MODEL_CONFIDENCE_THRESHOLD:
                    result["isUnknown"] = True
                    result["message"] = "该病害置信度较低，已加入人工审核队列"
                return result
            except Exception as e:
                logger.error(f"DeepSeek 识别失败，降级到 Mock 模式: {e}")
                # 降级到 Mock 模式
                return self._mock_fallback(filename)

        # === Mock 模式 ===
        # 计算图片哈希用于确定性结果
        img_hash = hashlib.md5(
            image_bytes[:1024] if image_bytes else b"empty"
        ).hexdigest()
        random.seed(img_hash)
        return self._mock_fallback(filename)
