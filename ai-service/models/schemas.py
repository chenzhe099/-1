"""Pydantic 数据模型"""
from pydantic import BaseModel, Field
from typing import Optional, List


class DiagnosisRequest(BaseModel):
    cropName: Optional[str] = Field(None, description="作物名称")


class DiagnosisResponse(BaseModel):
    diseaseName: str
    scientificName: Optional[str] = None
    confidence: float
    severity: str
    symptoms: Optional[str] = None
    treatment: Optional[dict] = None
    knowledgeRefs: List[str] = []
    isUnknown: bool = False


class RAGSearchRequest(BaseModel):
    query: str = Field(..., description="检索查询文本")
    topK: int = Field(5, ge=1, le=20)


class RAGSearchResult(BaseModel):
    documentId: str
    title: str
    score: float
    snippet: str
    sourceRegulation: Optional[str] = None


class RAGSearchResponse(BaseModel):
    query: str
    results: List[RAGSearchResult]


class AgentDecisionRequest(BaseModel):
    fieldId: str
    cropId: Optional[str] = None
    currentStage: Optional[str] = None
    weatherForecast: Optional[dict] = None
    soilData: Optional[dict] = None


class AgentRecommendation(BaseModel):
    type: str
    action: str
    reason: str


class AgentDecisionResponse(BaseModel):
    recommendations: List[AgentRecommendation]
    riskLevel: str
    confidence: float


class ModelVersionInfo(BaseModel):
    id: str
    modelName: str
    version: str
    accuracy: Optional[float] = None
    driftScore: Optional[float] = None
    status: str
    deployedAt: Optional[str] = None


class DriftCheckResponse(BaseModel):
    modelId: str
    driftScore: float
    isDrifting: bool
    recommendation: str
