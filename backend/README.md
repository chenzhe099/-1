# 业务后端 (Backend)

## 技术栈
- **Spring Boot** — Java 业务后端框架
- **MySQL** — 关系数据库（涉及地图时使用 PostGIS）
- **Redis** — 缓存与会话管理
- **Celery/RQ** — 异步任务队列

## 职责
- 用户认证与授权（JWT + RBAC）
- 农场、地块、作物 CRUD 业务逻辑
- 农事任务生成、提醒和完成状态管理
- 定时采集天气、市场价格和农业通报
- 图片异步上传、推理结果通知
- 调用 AI 服务的图像识别、RAG 和多 Agent 接口

## 接口规范
- RESTful API，OpenAPI/Swagger 文档
- 接口版本控制
- 统一错误码与鉴权方式（Bearer Token）

## 启动方式
```bash
cd backend
./mvnw spring-boot:run
```
