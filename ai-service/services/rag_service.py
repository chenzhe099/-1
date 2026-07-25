"""
RAG 农技规范检索增强生成服务
- 检索：TF-IDF 关键词匹配
- 生成：LLM 基于检索结果生成专业回答（可用时）
"""
import json
import os
import re
import math
import logging
from collections import Counter
from config import DATA_DIR
from services.llm_client import llm_client

logger = logging.getLogger(__name__)

RAG_SYSTEM_PROMPT = """你是一个专业的农业技术专家。请基于提供的农技规范文档，回答用户的问题。

## 回答要求：
1. 优先使用文档中的信息，引用具体规范编号
2. 如果文档信息不足，可以补充你的专业知识，但要明确说明
3. 回答要具体可操作，包含量化建议（用量、时间、频率等）
4. 使用中文回答，语言通俗易懂

## 回答格式：
{
    "answer": "详细回答内容",
    "sources": ["引用的规范1", "引用的规范2"],
    "confidence": "high|medium|low",
    "followUpQuestions": ["用户可以追问的问题1", "问题2"]
}"""


class RAGService:
    """农技规范检索增强生成服务 — 检索(TF-IDF) + 生成(LLM)"""

    def __init__(self):
        self._documents = self._load_documents()
        self._idf = self._compute_idf()

    # ==================== 文档加载 ====================

    def _load_documents(self) -> list:
        """加载知识文档"""
        kb_path = os.path.join(DATA_DIR, "knowledge_documents.json")
        if os.path.exists(kb_path):
            with open(kb_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    # ==================== 分词与向量化 ====================

    def _tokenize(self, text: str) -> list:
        """中文分词 (字符二元组 + 关键词提取)"""
        if not text:
            return []
        text = text.lower().strip()
        text = re.sub(r'[^一-鿿\w]', ' ', text)
        tokens = text.split()
        # 中文二元组
        chinese_chars = re.findall(r'[一-鿿]', text)
        for i in range(len(chinese_chars) - 1):
            tokens.append(chinese_chars[i] + chinese_chars[i + 1])
        tokens.extend(chinese_chars)
        return tokens

    def _compute_idf(self) -> dict:
        """计算 IDF"""
        N = len(self._documents)
        if N == 0:
            return {}
        doc_freq = Counter()
        for doc in self._documents:
            text = (doc.get("title", "") + " " + doc.get("originalText", "") +
                    " " + doc.get("category", ""))
            tokens = set(self._tokenize(text))
            for token in tokens:
                doc_freq[token] += 1
        return {token: math.log(N / (freq + 1)) + 1 for token, freq in doc_freq.items()}

    def _tfidf_vector(self, text: str) -> dict:
        """计算 TF-IDF 向量"""
        tokens = self._tokenize(text)
        if not tokens:
            return {}
        tf = Counter(tokens)
        max_tf = max(tf.values()) if tf else 1
        return {token: (count / max_tf) * self._idf.get(token, 1.0)
                for token, count in tf.items()}

    def _cosine_similarity(self, vec1: dict, vec2: dict) -> float:
        """余弦相似度"""
        if not vec1 or not vec2:
            return 0.0
        intersection = set(vec1.keys()) & set(vec2.keys())
        if not intersection:
            return 0.0
        dot_product = sum(vec1[k] * vec2[k] for k in intersection)
        norm1 = math.sqrt(sum(v ** 2 for v in vec1.values()))
        norm2 = math.sqrt(sum(v ** 2 for v in vec2.values()))
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return dot_product / (norm1 * norm2)

    # ==================== 检索 ====================

    def search(self, query: str, top_k: int = 5) -> dict:
        """检索相关农技规范"""
        if not self._documents:
            return {"query": query, "results": []}

        query_vec = self._tfidf_vector(query)
        scored_docs = []
        for doc in self._documents:
            doc_text = (doc.get("title", "") + " " + doc.get("originalText", "") +
                        " " + doc.get("category", "") + " " +
                        " ".join(doc.get("keywords", [])))
            doc_vec = self._tfidf_vector(doc_text)
            score = self._cosine_similarity(query_vec, doc_vec)
            scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        top_docs = scored_docs[:top_k]

        results = []
        for score, doc in top_docs:
            original_text = doc.get("originalText", "")
            snippet = original_text[:200] + "..." if len(original_text) > 200 else original_text
            results.append({
                "documentId": doc.get("id", ""),
                "title": doc.get("title", ""),
                "score": round(score, 4),
                "snippet": snippet,
                "sourceRegulation": doc.get("sourceRegulation", ""),
                "fullText": original_text,
            })

        return {"query": query, "results": results}

    # ==================== 生成回答 (RAG 核心) ====================

    def generate_answer(self, query: str, top_k: int = 5) -> dict:
        """
        RAG 增强生成：检索 + LLM 生成回答

        Args:
            query: 用户问题
            top_k: 检索文档数量

        Returns:
            dict: 包含检索结果和生成的回答
        """
        # Step 1: 检索相关文档
        search_result = self.search(query, top_k)
        results = search_result.get("results", [])

        # Step 2: 尝试 LLM 生成
        if llm_client.available and results:
            try:
                # 构建上下文
                context_parts = ["## 检索到的农技规范文档\n"]
                for i, doc in enumerate(results):
                    context_parts.append(f"### 文档{i+1}: {doc['title']}")
                    if doc.get("sourceRegulation"):
                        context_parts.append(f"规范编号: {doc['sourceRegulation']}")
                    context_parts.append(f"内容: {doc.get('fullText', doc.get('snippet', ''))}")
                    context_parts.append("")

                context = "\n".join(context_parts)
                user_msg = f"{context}\n## 用户问题\n{query}\n\n请基于以上文档回答问题。"

                llm_answer = llm_client.chat_json(
                    messages=[{"role": "user", "content": user_msg}],
                    system_prompt=RAG_SYSTEM_PROMPT,
                    temperature=0.3,
                )

                if llm_answer:
                    logger.info(f"RAG LLM生成成功，置信度: {llm_answer.get('confidence')}")
                    return {
                        "query": query,
                        "results": results,
                        "aiAnswer": llm_answer.get("answer", ""),
                        "sources": llm_answer.get("sources", []),
                        "confidence": llm_answer.get("confidence", "medium"),
                        "followUpQuestions": llm_answer.get("followUpQuestions", []),
                        "mode": "rag_llm",
                    }
            except Exception as e:
                logger.error(f"LLM生成回答失败: {e}")

        # Step 3: 降级 — 仅返回检索结果
        logger.info("LLM不可用，仅返回检索结果")
        return {
            "query": query,
            "results": results,
            "aiAnswer": "",
            "sources": [],
            "confidence": "low",
            "followUpQuestions": [],
            "mode": "retrieval_only",
        }

    # ==================== 索引管理 ====================

    def index_document(self, document: dict) -> dict:
        """索引新文档"""
        self._documents.append(document)
        self._idf = self._compute_idf()
        return {"status": "indexed", "documentId": document.get("id", "unknown")}
