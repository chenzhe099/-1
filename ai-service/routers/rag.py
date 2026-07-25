"""RAG 农技规范检索路由"""
from fastapi import APIRouter
from models.schemas import RAGSearchRequest, RAGSearchResponse
from services.rag_service import RAGService

router = APIRouter()
rag_service = RAGService()


@router.post("/rag/search", response_model=RAGSearchResponse)
async def search_knowledge(request: RAGSearchRequest):
    """
    语义检索农技规范和知识库

    输入病害描述或农业问题，检索最相关的农技规范文档。
    基于 TF-IDF 关键词匹配实现向量语义检索。

    - **query**: 检索查询文本 (如 "番茄叶片出现白色霉层如何防治")
    - **topK**: 返回结果数量 (1-20)
    """
    result = rag_service.search(request.query, request.topK)
    return RAGSearchResponse(**result)


@router.post("/rag/generate")
async def generate_answer(request: RAGSearchRequest):
    """
    RAG 增强生成：检索 + AI 生成回答

    不仅检索相关规范，还会使用 LLM 基于检索结果生成专业回答。
    当 LLM 不可用时，仅返回检索结果。

    - **query**: 检索查询文本
    - **topK**: 检索文档数量 (1-20)
    """
    result = rag_service.generate_answer(request.query, request.topK)
    return {"status": "ok", **result}


@router.post("/rag/index")
async def index_document(document: dict):
    """索引新知识文档到知识库"""
    result = rag_service.index_document(document)
    return {"status": "ok", **result}


@router.get("/rag/health")
async def rag_health():
    """RAG 服务健康检查"""
    return {
        "status": "healthy",
        "documents_count": len(rag_service._documents),
        "mode": "tf-idf"
    }
