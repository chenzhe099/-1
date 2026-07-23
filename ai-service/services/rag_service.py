"""
RAG 农技规范检索服务
基于 TF-IDF 关键词匹配模拟向量检索，从知识库中检索相关农技规范
"""
import json
import os
import re
import math
from collections import Counter
from config import DATA_DIR


class RAGService:
    """农技规范检索增强生成服务"""

    def __init__(self):
        self._documents = self._load_documents()
        self._idf = self._compute_idf()

    def _load_documents(self) -> list:
        """加载知识文档"""
        kb_path = os.path.join(DATA_DIR, "knowledge_documents.json")
        if os.path.exists(kb_path):
            with open(kb_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def _tokenize(self, text: str) -> list:
        """中文分词 (简单实现：基于字符二元组 + 关键词提取)"""
        if not text:
            return []
        text = text.lower().strip()

        # 移除标点符号
        text = re.sub(r'[^一-鿿\w]', ' ', text)
        tokens = text.split()

        # 中文二元组分词
        chinese_chars = re.findall(r'[一-鿿]', text)
        for i in range(len(chinese_chars) - 1):
            tokens.append(chinese_chars[i] + chinese_chars[i + 1])
        # 单个中文字符
        tokens.extend(chinese_chars)

        return tokens

    def _compute_idf(self) -> dict:
        """计算每个词的 IDF 值"""
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
        """计算文本的 TF-IDF 向量"""
        tokens = self._tokenize(text)
        if not tokens:
            return {}

        tf = Counter(tokens)
        max_tf = max(tf.values()) if tf else 1

        return {
            token: (count / max_tf) * self._idf.get(token, 1.0)
            for token, count in tf.items()
        }

    def _cosine_similarity(self, vec1: dict, vec2: dict) -> float:
        """计算余弦相似度"""
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

    def search(self, query: str, top_k: int = 5) -> dict:
        """
        检索相关农技规范

        Args:
            query: 检索查询 (如 "番茄叶片出现白色霉层")
            top_k: 返回结果数量

        Returns:
            dict: 包含检索结果的响应
        """
        if not self._documents:
            return {"query": query, "results": []}

        query_vec = self._tfidf_vector(query)

        # 计算每个文档的相似度
        scored_docs = []
        for doc in self._documents:
            doc_text = (doc.get("title", "") + " " + doc.get("originalText", "") +
                        " " + doc.get("category", "") + " " +
                        " ".join(doc.get("keywords", [])))
            doc_vec = self._tfidf_vector(doc_text)
            score = self._cosine_similarity(query_vec, doc_vec)
            scored_docs.append((score, doc))

        # 按分数排序
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
            })

        return {
            "query": query,
            "results": results,
        }

    def index_document(self, document: dict) -> dict:
        """索引新文档（重新计算 IDF）"""
        self._documents.append(document)
        self._idf = self._compute_idf()
        return {"status": "indexed", "documentId": document.get("id", "unknown")}
