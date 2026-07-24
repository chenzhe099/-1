# 🌾 智慧农业管理系统

> 云南特色农业智能诊断与生产管理平台  
> AI驱动 · 全链路数字化 · 前后端分离架构

---

## 🚀 快速开始

### 方式一：前端独立运行（Mock模式）

```bash
cd frontend
python -m http.server 8000
# 访问 http://localhost:8000
```

### 方式二：全栈运行（前后端分离）

**启动后端**（同事电脑）：
```bash
cd backend
mvn spring-boot:run
```

**启动前端**（本机）：
```bash
cd frontend
python -m http.server 8000
# 修改 frontend/js/api-client.js 中 API_BASE 为同事电脑IP:9090
```

### 方式三：Docker 一键部署

```bash
docker-compose up -d
```

---

## 📦 项目结构

```
-1/
├── frontend/                          # 前端（纯静态 SPA）
│   ├── index.html                     # 主页面入口（10+功能模块）
│   ├── css/styles.css                 # 组件化样式（卡片/表单/状态）
│   ├── js/
│   │   ├── app.js                     # 路由导航 + 模块渲染入口
│   │   ├── data-service.js            # 内存数据库 + MySQL同步
│   │   ├── api-client.js              # HTTP API 客户端（29张表映射）
│   │   ├── data-loader.js             # 三模式数据加载（API→JSON→内联）
│   │   ├── api.js                     # 备用 API 封装层
│   │   ├── interactions-later.js      # 统一事件委托（35+ data-action）
│   │   ├── ui.js / modal.js           # 统一 UI 组件（弹窗/表单/Toast）
│   │   ├── render-utils.js            # 渲染工具（任务卡片/预警列表等）
│   │   ├── handlers.js                # 交互事件处理（含延迟初始化）
│   │   ├── handlers-improved.js       # 增强版事件处理
│   │   └── charts.js                  # Chart.js 图表初始化
│   └── data/                          # 29张 JSON 种子数据
│       ├── users.json / crops.json / fields.json / ...
│       ├── farming_tasks.json / alerts.json / ...
│       ├── pest_knowledge_base.json    # 病虫害知识库
│       └── observations.json / agent_runs.json
│
├── backend/                           # Java Spring Boot 后端
│   ├── pom.xml
│   └── src/main/java/com/smartfarm/
│       ├── SmartFarmApplication.java  # 启动入口
│       ├── config/
│       │   ├── CorsConfig.java         # CORS 跨域配置
│       │   ├── SecurityConfig.java     # Spring Security + JWT
│       │   ├── JwtTokenProvider.java
│       │   └── SwaggerConfig.java
│       ├── controller/                # 14个REST控制器
│       │   ├── AuthController.java
│       │   ├── DashboardController.java
│       │   ├── DiseaseController.java  # 病虫害诊断接口
│       │   ├── FarmingController.java  # 农事/灌溉/施肥
│       │   ├── GenericCrudController.java  # 29张表通用CRUD
│       │   ├── DeviceController.java / WeatherController.java / ...
│       │   └── PermissionController.java / TraceabilityController.java
│       ├── entity/                    # 29个 JPA 实体
│       │   ├── Users.java / Crops.java / Fields.java / ...
│       │   ├── Observations.java / AgentRuns.java
│       │   └── ...
│       ├── repository/                # 数据库访问层
│       ├── service/                   # 业务逻辑
│       │   ├── AuthService.java
│       │   ├── DashboardService.java
│       │   ├── DataMigrationService.java  # 数据迁移
│       │   └── AiClientService.java       # AI服务调用
│       └── dto/                       # 数据传输对象
│
├── ai-service/                        # AI 微服务（FastAPI）
│   ├── main.py                        # FastAPI 入口
│   ├── config.py                      # 配置（含DeepSeek API Key）
│   ├── routers/
│   │   ├── diagnosis.py               # 病虫害图像诊断端点
│   │   ├── agent.py                   # AI Agent 推理
│   │   ├── rag.py                     # 知识库检索
│   │   └── model_monitor.py           # 模型监控
│   ├── services/
│   │   ├── image_classifier.py        # 🖼️ DeepSeek Vision API 识别
│   │   └── rag_service.py             # RAG 检索服务
│   └── requirements.txt
│
├── data-pipeline/                     # 数据采集管道
│   ├── fetchers/
│   │   ├── weather_fetcher.py         # 实时天气数据
│   │   └── market_fetcher.py          # 市场价格数据
│   └── db/connection.py               # MySQL 连接
│
├── docs/                              # 项目文档
│   ├── api-spec.md                    # API 接口规范
│   ├── database-design.md             # 数据库设计文档
│   ├── database/migrations/           # 数据库迁移脚本
│   └── deploy-guide.md               # 部署指南
│
├── deploy/                            # 部署配置
│   ├── docker-compose.yml
│   └── nginx.conf
│
└── scripts/                           # 辅助脚本
    ├── generate_java_entities.py
    ├── generate_sql_migrations.py
    └── fix_*.py / clean_*.py
```

---

## 🧩 功能模块（11大模块）

| 模块 | 说明 | 交互 |
|---|---|---|
| 📊 **数据总览** | 实时看板：气象/土壤/农事进度/产量预警 | 卡片联动跳转 |
| 🐛 **病虫害识别** | AI图片诊断 + 知识库 + 防治建议 + 规范原文对照 | 上传→识别→联动防治/规范 |
| 🌱 **精准农事** | 智能灌溉/施肥方案生成 + 地块日历 + 参数调整 | 增删改查 + 定时执行 |
| 📈 **产量预测** | AI产量预测 + 历史趋势图表 | 同比环比分析 |
| 🏠 **农场管理** | 种植周期/人员/库存/生产记录 | 全周期电子台账 |
| ⚙️ **设备监控** | IoT设备实时状态 + 远程控制 + 维护记录 | 重启/开关/紧急停止 |
| 🔗 **溯源管理** | 生产全过程追溯 + 溯源码生成 | 区块链式记录链 |
| 🔐 **权限管理** | 多级用户权限 + 角色管理 + 操作日志 | 增删改查 + 编辑用户 |
| 🌤️ **天气监测** | 实时气象数据 + 预警 | 未来7天预报 |
| 💰 **市场价格** | 农产品行情 + 价格趋势 | 品种对比分析 |
| 📋 **模型监控** | AI模型版本管理 + 运行状态 | 版本切换 + 重训练 |

---

## 🛠️ 技术栈

### 前端
| 技术 | 用途 |
|---|---|
| **HTML5 + Tailwind CSS** | 响应式布局 + 组件化样式 |
| **Chart.js 4.x** | 产量/气象/价格可视化图表 |
| **原生 JavaScript (ES6+)** | 事件委托(dataset) + 异步API + 内存数据库 |
| **Font Awesome 4.7** | 模块图标系统 |

### 后端
| 技术 | 用途 |
|---|---|
| **Java 17 + Spring Boot 3.x** | REST API 框架 |
| **Spring Data JPA + Hibernate** | ORM 数据库访问 |
| **Spring Security + JWT** | 认证授权 |
| **MySQL 8.x** | 关系型数据库 |
| **Flyway** | 数据库版本迁移 |
| **Swagger / OpenAPI** | API 文档自动生成 |

### AI 服务
| 技术 | 用途 |
|---|---|
| **Python FastAPI** | AI 微服务框架 |
| **DeepSeek Vision API** | 🖼️ 病虫害图像识别 |
| **LangChain + OpenAI SDK** | RAG 知识库检索 |
| **Scikit-learn** | 产量预测模型 |

### DevOps
| 技术 | 用途 |
|---|---|
| **Docker + Docker Compose** | 容器化部署 |
| **Nginx** | 反向代理 |
| **GitHub Actions** | CI/CD 流水线 |

---

## 🔗 数据流架构

```
┌──────────────┐      HTTP/JSON       ┌──────────────────┐
│   前端 SPA    │ ◄──────────────────► │  Spring Boot 后端  │
│  localhost:8000│     REST API         │  localhost:9090    │
│              │                      │                    │
│  data-loader.js│                      │  GenericCrudController│
│  (三模式加载) │                      │  (29张表通用CRUD)   │
└──────────────┘                      └────────┬───────────┘
                                               │ JPA
                                               ▼
┌──────────────┐      gRPC/HTTP      ┌──────────────────┐
│  AI 微服务    │ ◄──────────────────► │     MySQL 8.x     │
│  FastAPI      │   诊断/推理/RAG      │   29张业务表      │
│  DeepSeek API │                      │  Flyway 迁移      │
└──────────────┘                      └──────────────────┘
```

- 前端自动降级：**API可用 → MySQL数据** / **API不可用 → 本地JSON**
- CRUD操作**先写本地内存 → 异步同步MySQL**，失败自动回滚

---

## 📊 数据库（29张表）

```
用户权限: users / roles
农场档案: farms / fields / crops / planting_cycles
农事管理: farming_tasks / irrigation_plans / fertilization_plans
设备管理: devices / maintenance_records
病虫害: disease_records / pest_knowledge_base
生产溯源: products / production_timeline / quality_certifications
预测: yield_predictions
环境: environment_readings / soil_readings / weather_records
市场: market_prices
知识库: knowledge_documents
模型: model_versions
告警: alerts / operation_logs / inventory / personnel
扩展: observations / agent_runs
```

---

## 👥 团队协作

| 角色 | 负责 |
|---|---|
| **master（前端）** | SPA 交互/UI/数据加载/事件委托 |
| **czddady（后端）** | 后端API/数据库设计/Spring Boot/部署 |
| **Xx （AI服务）/ oliverdiana40** | AI服务/DeepSeek集成/图像识别 |

---

## 📝 License

MIT
