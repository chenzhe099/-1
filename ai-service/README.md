# AI 服务 (AI Service)

## 技术栈
- **Python + FastAPI** — AI 推理服务框架
- **LangChain / LlamaIndex** — RAG 与 Agent 编排
- **pgvector / Milvus** — 向量数据库
- **Celery / RQ** — 异步任务处理

## 职责
- 病虫害图像识别模型推理
- RAG 检索农技规范知识库
- 多 Agent 协同决策（天气 + 生育期 + 市场价格）
- 未知病害拒识与人工审核队列
- 模型版本管理与数据漂移监控
- 知识库版本维护

## API 端点
- `POST /api/v1/diagnosis` — 病虫害图像识别
- `POST /api/v1/rag/search` — 农技规范检索
- `POST /api/v1/agent/decision` — 多 Agent 综合决策
- `GET /api/v1/model/versions` — 模型版本列表
- `GET /api/v1/model/drift` — 数据漂移监控

## 启动方式
```bash
cd ai-service
uvicorn main:app --host 0.0.0.0 --port 8000
```
