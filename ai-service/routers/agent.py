"""多 Agent 协同决策路由"""
from fastapi import APIRouter
from models.schemas import AgentDecisionRequest, AgentDecisionResponse
from services.agent_service import AgentService

router = APIRouter()
agent_service = AgentService()


@router.post("/agent/decision", response_model=AgentDecisionResponse)
async def make_decision(request: AgentDecisionRequest):
    """
    多 Agent 协同农事决策

    综合天气、土壤、病虫害风险、市场四个维度的分析，
    由多个子 Agent 分别评估后汇总给出综合建议。

    - **fieldId**: 地块ID
    - **cropId**: 作物ID (可选)
    - **currentStage**: 当前生长阶段 (苗期/开花期/结果期/采收期等)
    - **weatherForecast**: 天气预报数据 (温度、降雨、湿度、风速)
    - **soilData**: 土壤数据 (湿度、N、P、K含量)

    返回灌溉、施肥、病虫害、市场四个方面的具体建议。
    """
    params = {
        "fieldId": request.fieldId,
        "cropId": request.cropId,
        "currentStage": request.currentStage or "结果期",
        "weatherForecast": request.weatherForecast,
        "soilData": request.soilData,
    }

    result = agent_service.make_decision(params)
    return AgentDecisionResponse(**result)


@router.get("/agent/health")
async def agent_health():
    """Agent 服务健康检查"""
    return {
        "status": "healthy",
        "mode": "rule-based agents",
        "agents": ["weather", "soil", "pest", "market"]
    }
