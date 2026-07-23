# 文档 (Documentation)

## 文档清单

### 需求与设计
- [需求规格说明书](./requirements.md) — 用户故事、用例图、功能和非功能需求
- [系统设计说明书](./architecture.md) — 架构图、ER 图、时序图、部署图

### 接口与数据库
- [前后端接口文档](./api-spec.md) — 接口版本、请求参数、错误码和鉴权方式
- [数据库设计](./database-design.md) — 主外键、唯一约束、索引、事务和迁移脚本

### 开发与测试
- [Git 协作规范](./git-workflow.md) — Issue、分支、Pull Request、代码评审记录
- [测试报告](./test-report.md) — 前端、后端、接口、数据库、AI 效果和性能测试

### 部署与演示
- [部署指南](./deploy-guide.md) — Docker Compose 一条命令启动
- [系统演示脚本](./demo-script.md) — 端到端业务流程演示

## 项目结构
```
project/
├── frontend/        # Vue 3 + TypeScript 前端
├── backend/         # Spring Boot 业务后端
├── ai-service/      # Python FastAPI AI 服务
├── data-pipeline/   # 数据采集管道
├── deploy/          # Docker Compose 部署配置
├── tests/           # 各层测试
└── docs/            # 本文档目录
```
