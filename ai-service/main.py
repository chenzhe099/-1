"""
智慧农业管理系统 - AI 服务入口
提供病虫害识别、RAG检索、多Agent决策、模型监控等功能

启动: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
文档: http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import diagnosis, rag, agent, model_monitor, chat

app = FastAPI(
    title="SmartFarm AI Service",
    description="智慧农业管理系统 - AI 智能服务\n\n"
                "提供病虫害图像识别、农技规范RAG检索、多Agent协同决策、"
                "模型性能监控等AI能力",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(diagnosis.router, prefix="/api/v1", tags=["病虫害识别"])
app.include_router(rag.router, prefix="/api/v1", tags=["RAG检索"])
app.include_router(agent.router, prefix="/api/v1", tags=["Agent决策"])
app.include_router(model_monitor.router, prefix="/api/v1", tags=["模型监控"])
app.include_router(chat.router, prefix="/api/v1", tags=["AI智能对话"])


@app.get("/")
async def root():
    """服务根路径"""
    return {
        "service": "SmartFarm AI Service",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """全局健康检查"""
    return {
        "status": "healthy",
        "services": {
            "diagnosis": "/api/v1/diagnosis/health",
            "rag": "/api/v1/rag/health",
            "agent": "/api/v1/agent/health",
            "model_monitor": "/api/v1/model/health",
            "chat": "/api/v1/chat/health",
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
