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
