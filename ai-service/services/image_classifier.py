"""
病虫害图像识别服务 (Mock 实现)
基于规则引擎模拟 AI 病害识别，返回真实感结果
"""
import json
import os
import hashlib
import random
from config import DATA_DIR, MOCK_MODE, MODEL_CONFIDENCE_THRESHOLD


# 图片文件名关键词 -> 病害映射
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
    """模拟图像分类器"""

    def __init__(self):
        self._knowledge_base = self._load_knowledge_base()

    def _load_knowledge_base(self) -> list:
        """加载病虫害知识库"""
        kb_path = os.path.join(DATA_DIR, "pest_knowledge_base.json")
        if os.path.exists(kb_path):
            with open(kb_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def _determine_disease(self, filename: str) -> tuple:
        """根据文件名确定病害"""
        filename_lower = filename.lower()
        for pattern, disease in DISEASE_PATTERNS.items():
            if pattern in filename_lower:
                return disease, 0.85 + random.uniform(0, 0.14)
        # 随机选择一个知识库中的病害
        if self._knowledge_base:
            kb = random.choice(self._knowledge_base)
            return kb.get("name", "未知病害"), 0.65 + random.uniform(0, 0.15)
        return "未知病害", 0.3

    def predict(self, image_bytes: bytes, filename: str = "unknown.jpg") -> dict:
        """
        对输入图片进行病虫害识别

        Args:
            image_bytes: 图片字节数据
            filename: 原始文件名

        Returns:
            dict: 识别结果，包含病害名、置信度、防治方案等
        """
        # 计算图片哈希 (用于确定性结果)
        img_hash = hashlib.md5(image_bytes[:1024]).hexdigest() if image_bytes else "empty"
        random.seed(img_hash)

        disease_name, confidence = self._determine_disease(filename)

        # 查找知识库中的详细信息
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
            "diseaseName": disease_name,
            "scientificName": kb_entry.get("scientificName", "") if kb_entry else "",
            "confidence": round(confidence, 4),
            "severity": kb_entry.get("severity", "medium") if kb_entry else "low",
            "symptoms": kb_entry.get("symptoms", "") if kb_entry else "",
            "treatment": {
                "chemical": kb_entry.get("chemicalControl", []) if kb_entry else [],
                "biological": kb_entry.get("biologicalControl", []) if kb_entry else [],
                "agricultural": kb_entry.get("agriculturalControl", []) if kb_entry else [],
            } if kb_entry else {},
            "knowledgeRefs": [kb_entry.get("id", "")] if kb_entry else [],
            "isUnknown": is_unknown,
        }

        if is_unknown:
            result["message"] = "该病害置信度较低，已加入人工审核队列"
            result["diseaseName"] = f"疑似{disease_name}（待审核）"

        return result
