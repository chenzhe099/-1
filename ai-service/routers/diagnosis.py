"""病虫害识别路由"""
from fastapi import APIRouter, UploadFile, File, Form
from models.schemas import DiagnosisResponse
from services.image_classifier import ImageClassifier

router = APIRouter()
classifier = ImageClassifier()


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


@router.get("/diagnosis/health")
async def diagnosis_health():
    """模型健康检查"""
    return {
        "status": "healthy",
        "model": "PestDiseaseClassifier v3.2.1",
        "knowledgeBaseSize": len(classifier._knowledge_base),
        "mode": "mock" if __import__("config").MOCK_MODE else "production"
    }
