# 系统设计说明书

## 选题三：云南特色农业智能诊断与生产管理平台

---

## 1. 系统架构图

```
┌──────────────────────────────────────────────────────────────────┐
│                          用户接入层                               │
│   农户(H5)     农技人员(Web)     合作社管理人员(Web)     管理员(Web)  │
└──────────────────────────┬───────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼───────────────────────────────────────┐
│                    Nginx (反向代理 / 静态资源)                     │
│                    Port: 80                                      │
└──────┬────────────────────────────────────┬──────────────────────┘
       │                                    │
┌──────▼──────────┐               ┌────────▼───────────────────────┐
│   Frontend      │   REST API    │        Backend                 │
│   HTML5 +       │◄────JSON─────►│   Spring Boot 3.2              │
│   Tailwind CSS  │   JWT Auth    │   Spring Security + JWT        │
│   Chart.js      │               │   Spring Data JPA              │
│   Native JS     │               │   Port: 8080                   │
│   (Static)      │               │                                │
└─────────────────┘               └────────┬───────────────────────┘
                                           │
             ┌─────────────────────────────┼──────────────────┐
             │                             │                  │
      ┌──────▼──────┐            ┌────────▼──────┐   ┌───────▼──────┐
      │   MySQL 8   │            │   Redis 7     │   │  AI Service  │
      │   主数据库   │            │   缓存/队列    │   │  FastAPI     │
      │   27张表    │            │   Port: 6379  │   │  Port: 8000  │
      │   Port:3306 │            │               │   │              │
      └─────────────┘            └───────────────┘   └───────┬──────┘
                                                              │
                    ┌─────────────────────────────────────────┼──────┐
                    │                         │               │      │
             ┌──────▼──────┐    ┌─────────────▼──┐    ┌──────▼──────┐
             │  MinIO      │    │  Milvus/pgvector│   │  Data       │
             │  图片存储    │    │  向量数据库     │    │  Pipeline   │
             │  Port:9000  │    │  RAG知识检索    │    │  定时采集    │
             └─────────────┘    └────────────────┘    └─────────────┘
```

---

## 2. 时序图

### 2.1 病虫害识别完整流程

```
农户         Frontend        Backend       AI Service      MinIO     MySQL
 │              │               │               │             │         │
 │  拍摄照片     │               │               │             │         │
 │─────────────►│               │               │             │         │
 │              │ POST /api/v1/ │               │             │         │
 │              │ disease/upload│               │             │         │
 │              │ (FormData)    │               │             │         │
 │              │──────────────►│               │             │         │
 │              │               │  上传图片到    │             │         │
 │              │               │  MinIO        │             │         │
 │              │               │─────────────────────────────►        │
 │              │               │             文件URL       │         │
 │              │               │◄─────────────────────────────        │
 │              │               │               │             │         │
 │              │               │ POST /diagnose│             │         │
 │              │               │ (image_url)   │             │         │
 │              │               │──────────────►│             │         │
 │              │               │               │ 图像分类     │         │
 │              │               │               │ ResNet-50   │         │
 │              │               │               │──┐          │         │
 │              │               │               │◄─┘          │         │
 │              │               │               │             │         │
 │              │               │               │ RAG检索     │         │
 │              │               │               │ 农技规范    │         │
 │              │               │               │──┐          │         │
 │              │               │               │◄─┘          │         │
 │              │               │               │             │         │
 │              │               │  诊断结果      │             │         │
 │              │               │ (病害+防治建议)│             │         │
 │              │               │◄──────────────│             │         │
 │              │               │               │             │         │
 │              │               │ 保存诊断记录   │             │         │
 │              │               │─────────────────────────────►         │
 │              │               │◄─────────────────────────────         │
 │              │               │               │             │         │
 │              │   识别结果     │               │             │         │
 │              │◄──────────────│               │             │         │
 │              │               │               │             │         │
 │  显示病害名   │               │               │             │         │
 │  +防治建议    │               │               │             │         │
 │  +规范对照    │               │               │             │         │
 │◄─────────────│               │               │             │         │
```

### 2.2 Agent 综合决策流程

```
定时触发/手动 → Backend → AI Service Agent → RAG检索 → 综合判断 → 返回决策 → 生成农事任务

详细步骤:
1. Backend 发送决策请求 (field_id, current_data)
2. AI Service 并行调用:
   - 天气API获取7日预报
   - 土壤传感器获取最新数据
   - 市场API获取当前价格
   - RAG检索相关种植规范
3. Agent 综合所有信息, 输出:
   - 推荐农事操作 (灌溉/施肥/喷药)
   - 风险评估 (病虫害/天气/市场)
   - 优先级排序
4. Backend 根据决策自动生成农事任务
5. 推送通知给负责人
```

### 2.3 用户认证流程

```
客户端                    Backend                   MySQL
  │                         │                        │
  │ POST /api/auth/login    │                        │
  │ {username, password}    │                        │
  │────────────────────────►│                        │
  │                         │ SELECT * FROM users     │
  │                         │ WHERE username=?        │
  │                         │───────────────────────►│
  │                         │◄───────────────────────│
  │                         │                        │
  │                         │ BCrypt.matches(pwd)     │
  │                         │──┐                     │
  │                         │◄─┘                     │
  │                         │                        │
  │                         │ JWT.generate(           │
  │                         │   username, role,       │
  │                         │   exp=24h               │
  │                         │ )                       │
  │                         │──┐                     │
  │                         │◄─┘                     │
  │                         │                        │
  │ {token, userId, role}   │                        │
  │◄────────────────────────│                        │
  │                         │                        │
  │ 后续请求 Header:        │                        │
  │ Authorization: Bearer   │ JWT验证 → SecurityContext
  │  <token>                │                        │
```

---

## 3. 部署图

```
┌─────────────────────────────────────────────────────────────┐
│                    生产服务器 (Linux)                         │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │              Docker Compose 编排                   │      │
│  │                                                  │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │      │
│  │  │ frontend │  │ backend  │  │  ai-service   │   │      │
│  │  │ (Nginx)  │  │ (Java)   │  │  (Python)     │   │      │
│  │  │  :80     │  │  :8080   │  │  :8000        │   │      │
│  │  └──────────┘  └──────────┘  └──────────────┘   │      │
│  │                                                  │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │      │
│  │  │  MySQL   │  │  Redis   │  │  data-pipe    │   │      │
│  │  │  :3306   │  │  :6379   │  │  (Cron)       │   │      │
│  │  └──────────┘  └──────────┘  └──────────────┘   │      │
│  │                                                  │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │      │
│  │  │  MinIO   │  │  etcd    │  │  Celery       │   │      │
│  │  │  :9000   │  │  :2379   │  │  Worker       │   │      │
│  │  └──────────┘  └──────────┘  └──────────────┘   │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  外部依赖:                                                   │
│  ┌──────────────────────────────────────────────────┐      │
│  │  中国天气网API  │  农产品交易市场API  │  短信通知服务  │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. ER 图 (核心实体关系)

```
farms (农场)
  │ 1
  │
  ├───┬─── fields (地块)
  │       │ 1
  │       │
  │       ├───┬─── planting_cycles (种植周期)
  │       │       │ 1
  │       │       │
  │       │       ├─── observations (田间观测)
  │       │       │
  │       │       └─── products (农产品)
  │       │               │ 1
  │       │               │
  │       │               ├─── production_timeline (生产时间线)
  │       │               │
  │       │               └─── quality_certifications (质量认证)
  │       │
  │       ├─── soil_readings (土壤读数)
  │       │
  │       ├─── irrigation_plans (灌溉方案)
  │       │
  │       ├─── fertilization_plans (施肥方案)
  │       │
  │       ├─── disease_records (病虫害记录)
  │       │
  │       └─── farming_tasks (农事任务)
  │
  ├─── devices (设备)
  │       │
  │       ├─── environment_readings (环境读数)
  │       │
  │       └─── maintenance_records (维护记录)
  │
  └─── users (用户)
          │
          ├─── operation_logs (操作日志)
          │
          └─── farming_tasks.assigned_to (任务指派)

独立实体:
  crops (作物品种库)
  pest_knowledge_base (病虫害知识库)
  knowledge_documents (农技规范文档)
  model_versions (AI模型版本)
  agent_runs (Agent执行记录)
  weather_records (天气记录)
  market_prices (市场价格)
  alerts (系统预警)
  inventory (库存)
  personnel (人员)
  roles (角色权限)
```

### 主外键约束

| 子表 | 外键 | 引用表 | 删除策略 |
|------|------|--------|----------|
| fields | farm_id | farms | SET NULL |
| planting_cycles | field_id | fields | CASCADE |
| planting_cycles | farm_id | farms | SET NULL |
| observations | field_id | fields | CASCADE |
| disease_records | field_id | fields | SET NULL |
| farming_tasks | field_id | fields | SET NULL |
| farming_tasks | assigned_to | users | SET NULL |
| products | field_id | fields | SET NULL |
| production_timeline | product_id | products | CASCADE |
| quality_certifications | product_id | products | CASCADE |
| environment_readings | device_id | devices | CASCADE |
| soil_readings | field_id | fields | CASCADE |
| maintenance_records | device_id | devices | CASCADE |
| operation_logs | user_id | users | SET NULL |

---

## 5. 技术选型说明

| 组件 | 选型 | 理由 |
|------|------|------|
| 前端 | HTML5 + Tailwind CSS + Chart.js + 原生JS | 无需构建工具, CDN加载, 直接浏览器运行 |
| 业务后端 | Spring Boot 3.2 + Spring Security | 成熟稳定的企业级框架, JPA简化数据访问, JWT无状态认证 |
| AI服务 | Python 3.11 + FastAPI | Python生态支持ML框架, FastAPI异步高性能, 自动生成API文档 |
| 关系数据库 | MySQL 8.0 | 成熟可靠, 支持事务, 生态完善 |
| 向量数据库 | pgvector / Milvus | 支持RAG语义检索, 与农技规范知识库匹配 |
| 文件存储 | MinIO | S3兼容, 私有化部署, 适合图片存储 |
| 缓存 | Redis 7 | 高性能缓存, 支持任务队列(Celery/RQ) |
| 容器化 | Docker + Docker Compose | 一键部署, 环境一致性, 服务编排 |
| API文档 | Swagger / OpenAPI 3.0 | 自动生成, 交互式测试 |

---

## 6. 安全设计

- **认证**: JWT (HS256), Token有效期24小时
- **授权**: RBAC 四角色 (admin/technician/farmer/manager), 每个角色有独立的模块访问权限
- **密码**: BCrypt加密存储
- **API安全**: CORS白名单, CSRF禁用(纯API无状态)
- **文件上传**: 类型白名单(JPG/PNG), 大小限制10MB, MinIO隔离存储
- **数据合规**: 操作日志全记录, 支持审计追溯
- **HTTPS**: Nginx反向代理, 生产环境启用TLS
