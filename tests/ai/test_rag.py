"""RAG 农技规范检索服务测试"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'ai-service'))

from services.rag_service import RAGService


def test_rag_init():
    """测试 RAG 服务初始化"""
    rag = RAGService()
    assert rag._documents is not None
    assert len(rag._documents) > 0


def test_search_returns_results():
    """测试搜索返回结果"""
    rag = RAGService()
    result = rag.search("番茄叶片出现白色霉层", top_k=3)
    assert "query" in result
    assert "results" in result
    assert len(result["results"]) > 0


def test_search_result_structure():
    """测试搜索结果结构"""
    rag = RAGService()
    result = rag.search("病害防治", top_k=1)
    for r in result["results"]:
        assert "documentId" in r
        assert "title" in r
        assert "score" in r
        assert "snippet" in r


def test_empty_query():
    """测试空查询"""
    rag = RAGService()
    result = rag.search("", top_k=5)
    assert "results" in result


if __name__ == '__main__':
    test_rag_init()
    test_search_returns_results()
    test_search_result_structure()
    test_empty_query()
    print("All RAG tests passed!")
