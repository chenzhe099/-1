"""病虫害识别路由"""
from fastapi import APIRouter, UploadFile, File, Form
from models.schemas import DiagnosisResponse
from services.image_classifier import ImageClassifier

router = APIRouter()
classifier = ImageClassifier()

# 懒加载本地 PyTorch 分类器（模型文件约 48MB）
_local_classifier = None


def _get_local_classifier():
    """懒加载本地模型，避免启动时内存占用"""
    global _local_classifier
    if _local_classifier is None:
        try:
            from services.local_classifier import LocalTorchClassifier
            _local_classifier = LocalTorchClassifier()
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"本地模型加载失败: {e}")
            _local_classifier = None
    return _local_classifier


@router.post("/diagnosis", response_model=DiagnosisResponse)
async def diagnose_disease(
    file: UploadFile = File(...),
    cropName: str = Form(None)
):
    """
    上传作物图片，进行病虫害AI识别

    - **file**: 图片文件 (JPG/PNG, 最大10MB)
    - **cropName**: 可选，作物名称，辅助提高识别精度

    返回病虫害名称、置信度、防治方案等。
    低置信度结果会标记为"未知样本"并进入人工审核队列。
    """
    image_bytes = await file.read()
    result = classifier.predict(
        image_bytes,
        filename=file.filename or "unknown.jpg",
        crop_name=cropName,
    )

    # 添加作物信息到结果
    if cropName:
        result["cropAffected"] = cropName

    return DiagnosisResponse(**result)


@router.post("/diagnosis/local", response_model=DiagnosisResponse)
async def diagnose_local(
    file: UploadFile = File(...),
    cropName: str = Form(None)
):
    """
    使用本地 PyTorch 模型进行病虫害识别（离线可用，无需 API Key）

    - **file**: 图片文件 (JPG/PNG, 最大10MB)
    - **cropName**: 可选，作物名称，辅助验证和提高精度

    模型: EfficientNet-B3，基于 PlantVillage + Rice Leaf 等公开数据集训练
    返回与 /diagnosis 相同格式的结果
    """
    image_bytes = await file.read()
    local_clf = _get_local_classifier()

    if local_clf is None or not local_clf.is_available:
        # 降级到 Mock 模式
        result = classifier._mock_fallback(file.filename or "unknown.jpg")
    else:
        result = local_clf.predict(
            image_bytes,
            filename=file.filename or "unknown.jpg",
            crop_name=cropName,
        )

    if cropName:
        result["cropAffected"] = cropName

    return DiagnosisResponse(**result)


@router.get("/diagnosis/health")
async def diagnosis_health():
    """模型健康检查"""
    return {
        "status": "healthy",
        "model": "PestDiseaseClassifier v3.2.1",
        "knowledgeBaseSize": len(classifier._knowledge_base),
        "mode": "mock" if __import__("config").MOCK_MODE else "production"
    }


@router.get("/diagnosis/local/health")
async def local_model_health():
    """本地模型健康检查"""
    local_clf = _get_local_classifier()
    if local_clf is not None and local_clf.is_available:
        stats = local_clf.get_stats()
        return {
            "status": "healthy",
            "model": "EfficientNet-B3 v1.0",
            "device": stats["device"],
            "model_loaded": True,
            "total_predictions": stats["total_predictions"],
            "unknown_rate": stats["unknown_rate"],
        }
    return {
        "status": "unavailable",
        "model": "EfficientNet-B3 v1.0",
        "model_loaded": False,
        "message": "模型文件未找到或加载失败，请先运行训练并导出模型"
    }
