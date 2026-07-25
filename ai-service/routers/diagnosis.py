"""病虫害识别路由 - 多模型支持"""
from fastapi import APIRouter, UploadFile, File, Form
from models.schemas import DiagnosisResponse
from services.image_classifier import classifier
from config import MODELS, DEFAULT_MODEL

router = APIRouter()


@router.post("/diagnosis", response_model=DiagnosisResponse)
async def diagnose_disease(
    file: UploadFile = File(...),
    cropName: str = Form(None),
    model: str = Form(DEFAULT_MODEL),
):
    image_bytes = await file.read()
    result = classifier.predict(
        image_bytes, filename=file.filename or "unknown.jpg",
        crop_name=cropName, model=model)
    if cropName:
        result["cropAffected"] = cropName
    return DiagnosisResponse(**result)


@router.get("/diagnosis/health")
async def diagnosis_health():
    return {
        "status": "healthy",
        "models": {k: {"name": v["name"], "ready": k in classifier._clients}
                   for k, v in MODELS.items()},
        "default": DEFAULT_MODEL
    }


@router.get("/models")
async def list_models():
    return [{"key": k, "name": v["name"], "ready": k in classifier._clients}
            for k, v in MODELS.items()]
