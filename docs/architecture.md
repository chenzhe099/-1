# 系统架构设计说明书

## 选题：云南特色农业智能诊断与生产管理平台

## 1. 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                │
│  农户(微信小程序)  农技人员(Web)  管理员(Web)  合作社(Web)    │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────────────┐
│                   Nginx (反向代理 + 静态文件)                 │
└──────┬──────────────────────────────────┬───────────────────┘
       │                                  │
┌──────▼──────┐                    ┌──────▼──────────────┐
│   Frontend  │                    │    Backend           │
│  Vue 3 SPA  │──── REST API ────▶│  Spring Boot         │
│  (Port 80)  │                    │  (Port 8080)         │
└─────────────┘                    └──────┬───────────────┘
                                          │
                    ┌─────────────────────┼─────────────────┐
                    │                     │                  │
              ┌─────▼─────┐    ┌─────────▼────┐   ┌───────▼──────┐
              │   MySQL   │    │    Redis      │   │  AI Service  │
              │  (3306)   │    │   (6379)      │   │  FastAPI     │
              └───────────┘    └──────────────┘   │  (8000)      │
                                                   └───────┬──────┘
                                                           │
                              ┌────────────────────────────┼────────────┐
                              │                            │            │
                        ┌─────▼─────┐   ┌──────────┐  ┌──▼──────────┐
                        │ PostgreSQL│   │  Milvus  │  │   MinIO     │
                        │ +pgvector │   │ (19530)  │  │  (9000)     │
                        │  (5432)   │   │          │  │             │
                        └───────────┘   └──────────┘  └─────────────┘
```

## 2. 核心业务流程

```
建立地块 → 登记作物 → 上传异常图片 → 模型识别 → RAG检索农技规范
→ Agent综合天气与生育期 → 农技人员审核 → 生成农事任务 → 跟踪处置效果
```

## 3. ER 图（核心实体）

```
farms ──┬── fields ──┬── planting_cycles
        │            ├── soil_readings
        │            ├── irrigation_plans
        │            └── fertilization_plans
        │
        ├── devices ──── environment_readings
        │
        ├── farming_tasks
        │
        ├── products ──┬── production_timeline
        │              └── quality_certifications
        │
        ├── disease_records
        │
        └── users ──── operation_logs

knowledge_documents ─── (RAG retrieval)
model_versions ──────── (AI model tracking)
weather_records ─────── (external API)
market_prices ───────── (external API)
```

## 4. 技术选型理由

| 组件 | 选型 | 理由 |
|------|------|------|
| 前端 | Vue 3 + TypeScript | 类型安全、组件化、生态丰富 |
| 业务后端 | Spring Boot | 成熟稳定、事务支持好、Java 生态 |
| AI 服务 | Python + FastAPI | ML 生态、异步支持、高性能 |
| 向量库 | Milvus / pgvector | 支持 RAG 语义检索 |
| 文件存储 | MinIO | S3 兼容、私有部署、图片存储 |
| 部署 | Docker Compose | 一键启动全部服务 |
