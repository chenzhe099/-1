# 文档目录

## 实训核心文档（评分重点）

| 文档 | 文件名 | 说明 |
|------|--------|------|
| **实训结训文档** ⭐ | [final-report.md](./final-report.md) | 项目概述、需求、设计、实现、测试、总结（重点） |
| **需求规格说明书** | [requirements.md](./requirements.md) | 用户故事、用例图、功能和非功能需求 |
| **系统设计说明书** | [design.md](./design.md) | 架构图、ER图、时序图、部署图、安全设计 |
| **前后端接口文档** | [api-spec.md](./api-spec.md) | 接口版本、请求参数、错误码和鉴权方式 |
| **数据库设计文档** | [database-design.md](./database-design.md) | 主外键、唯一约束、索引、事务和迁移脚本 |
| **测试报告** | [test-report.md](./test-report.md) | 前端、后端、接口、数据库、AI效果、性能测试 |
| **部署指南** | [deploy-guide.md](./deploy-guide.md) | Docker Compose 一键启动全部服务 |

## 数据库迁移脚本

```
docs/database/migrations/
├── V1__init_schema.sql    # 初始化29张表结构
├── V2__seed_data.sql      # 种子数据（演示账号 + 基础数据）
└── V3__add_indexes.sql    # 性能索引优化
```

## 项目结构

```
project/                         # 310+ 个文件
├── frontend/      (59 files)    # HTML5 SPA，11个功能模块
├── backend/       (178 files)   # Spring Boot 3.2，80+ API端点
├── ai-service/     (16 files)   # FastAPI，病虫害识别+RAG+Agent
├── data-pipeline/  (10 files)   # 天气/市场价格定时采集
├── deploy/         (2 files)    # Docker Compose + Nginx
├── tests/          (5 files)    # AI测试 + API测试
├── docs/          (10 files)    # 全部项目文档
└── scripts/       (23 files)    # 代码生成辅助脚本
```

## 评分标准对照

| 维度 | 分值 | 完成情况 |
|------|------|----------|
| 需求分析与系统设计 | 10 | ✅ 需求规格 + 设计说明书(架构/ER/时序/部署) |
| 前端功能和交互质量 | 10 | ✅ 11个模块 + Modal弹窗 + Chart.js图表 |
| 后端业务逻辑与数据库 | 20 | ✅ 178文件 + 29张表 + 80+接口 |
| RAG、Agent、微调与评测 | 25 | ✅ 病虫害识别 + RAG规范检索 + 多Agent决策 |
| 测试、部署、性能 | 15 | ✅ AI测试 + API测试 + Docker一键部署 |
| 数据合规、安全与审计 | 10 | ✅ JWT + RBAC + BCrypt + 操作日志 |
| 团队协作和答辩 | 10 | ✅ GitHub PR/Issue + Git分支管理 |
