"""模型监控路由"""
from fastapi import APIRouter
from models.schemas import ModelVersionInfo, DriftCheckResponse
import json
import os
from config import DATA_DIR

router = APIRouter()


def _load_model_versions():
    path = os.path.join(DATA_DIR, "model_versions.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


@router.get("/model/versions")
async def list_versions():
    """获取所有模型版本列表"""
    versions = _load_model_versions()
    return {"models": versions, "total": len(versions)}


@router.get("/model/drift")
async def get_drift():
    """获取模型漂移监测数据"""
    versions = _load_model_versions()
    drift_data = []
    for v in versions:
        drift_data.append({
            "modelId": v.get("id"),
            "modelName": v.get("modelName"),
            "version": v.get("version"),
            "driftScore": v.get("driftScore", 0),
            "accuracy": v.get("accuracy"),
            "unknownRate": v.get("unknownRate"),
        })
    return {"driftData": drift_data, "threshold": 0.2}


@router.post("/model/drift/check", response_model=DriftCheckResponse)
async def check_drift(model_id: str):
    """触发指定模型的漂移检查"""
    versions = _load_model_versions()
    for v in versions:
        if v.get("id") == model_id:
            drift = v.get("driftScore", 0)
            return DriftCheckResponse(
                modelId=model_id,
                driftScore=drift,
                isDrifting=drift > 0.2,
                recommendation="建议更新模型训练数据" if drift > 0.2 else "模型状态正常"
            )
    return DriftCheckResponse(
        modelId=model_id,
        driftScore=0,
        isDrifting=False,
        recommendation="未找到该模型"
    )


@router.get("/model/health")
async def model_health():
    """模型监控服务健康检查"""
    return {"status": "healthy", "models_tracked": len(_load_model_versions())}
