# 前后端接口文档

## 基本信息

- **Base URL**: `http://localhost:8080/api/v1`
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证接口

### POST /auth/login
登录获取 JWT Token

**Request:**
```json
{"username": "admin", "password": "123456"}
```
**Response:**
```json
{
  "code": 200,
  "data": {
    "token": "eyJhbG...",
    "userId": "u001",
    "username": "admin",
    "displayName": "系统管理员",
    "role": "admin"
  }
}
```

### GET /auth/me
获取当前用户信息 (需认证)

## 通用 CRUD 接口

所有27张表通过统一的 RESTful 接口访问:

| Method | Path | 说明 |
|--------|------|------|
| GET | /api/v1/{table} | 查询列表 |
| GET | /api/v1/{table}/{id} | 查询单个 |
| POST | /api/v1/{table} | 新增 |
| PUT | /api/v1/{table}/{id} | 更新 |
| DELETE | /api/v1/{table}/{id} | 删除 |

## 业务模块接口

### Dashboard (数据总览)
| GET | /dashboard/stats | 统计卡片 |
| GET | /dashboard/fields | 地块状态 |
| GET | /dashboard/tasks/today | 今日任务 |
| GET | /dashboard/alerts | 预警列表 |
| GET | /dashboard/environment | 环境趋势 |

### Disease (病虫害识别)
| GET | /disease/records | 识别历史 |
| GET | /disease/knowledge | 知识库 |
| POST | /disease/diagnose | 上传图片识别 (multipart) |
| GET | /disease/trend | 病虫害趋势 |

### Farming (精准农事)
| GET | /farming/irrigation | 灌溉方案 |
| GET | /farming/fertilization | 施肥方案 |
| GET/POST/PUT/DELETE | /farming/tasks | 任务CRUD |
| POST | /farming/irrigation/{id}/execute | 执行灌溉 |

### 其余模块...
(完整 API 文档见 Swagger UI: http://localhost:8080/swagger-ui.html)

## 错误码

| Code | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

## AI 服务接口

| Method | AI Service Path | 说明 |
|--------|----------------|------|
| POST | /api/v1/diagnosis | 病虫害图片识别 |
| POST | /api/v1/rag/search | RAG规范检索 |
| POST | /api/v1/agent/decision | Agent决策 |
| GET | /api/v1/model/versions | 模型版本 |
| GET | /api/v1/model/drift | 漂移监测 |
