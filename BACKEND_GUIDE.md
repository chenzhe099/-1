# 后端接入指南

> 前端已完成全模块交互优化，同事只需启动后端（端口 9090），前端自动从 JSON 切换至 MySQL 模式。

---

## 一、前端改动概要

### 新增文件
| 文件 | 作用 |
|---|---|
| `frontend/js/ui.js` | 统一交互组件：toast/form/confirm/detail/table/loading |
| `frontend/js/interactions-later.js` | 全局事件委托：所有按钮点击由 `data-action` 属性统一分发 |

### 核心改动
- 全部可点击元素通过 `data-action` 属性统一由事件委托接管，不再依赖 `onclick` 或 `class` 选择器绑定
- 增删改查统一走 `dataService.insert/update/delete(table, id, data)`
- `api-client.js` 超时 3 秒，后端不可用时自动回退本地 JSON
- `modal.js` 弹窗不再堆叠，`_open` 自动清理上一个弹窗

---

## 二、后端只需做一件事

**启动后端 → 前端自动切换数据库模式**

```
后端端口：localhost:9090
API前缀：/api/v1/
检测逻辑：data-loader.js 尝试加载 29 张表，≥20 张成功即切换 MySQL 模式
```

### 2.1 必须实现的通用 CRUD

29 张表每张只需要 2 个端点（前端 `dataService` 逐表调用）：

```
GET  /api/v1/{table}         → 返回该表全量数据（数组）
GET  /api/v1/{table}/{id}    → 返回单条记录
POST /api/v1/{table}         → 新增一条记录（body: JSON）
PUT  /api/v1/{table}/{id}    → 更新一条记录（body: JSON）
DELETE /api/v1/{table}/{id}  → 删除一条记录
```

表名映射在 `api-client.js:113-127`：

```js
users                     → /api/v1/users
roles                     → /api/v1/roles
fields                    → /api/v1/fields
crops                     → /api/v1/crops
farming_tasks             → /api/v1/farming_tasks
devices                   → /api/v1/devices
irrigation_plans          → /api/v1/irrigation_plans
fertilization_plans       → /api/v1/fertilization_plans
maintenance_records       → /api/v1/maintenance_records
disease_records           → /api/v1/disease_records
pest_knowledge_base       → /api/v1/pest_knowledge_base
products                  → /api/v1/products
production_timeline       → /api/v1/production_timeline
quality_certifications    → /api/v1/quality_certifications
yield_predictions         → /api/v1/yield_predictions
environment_readings      → /api/v1/environment_readings
soil_readings             → /api/v1/soil_readings
alerts                    → /api/v1/alerts
operation_logs            → /api/v1/operation_logs
inventory                 → /api/v1/inventory
personnel                 → /api/v1/personnel
farms                     → /api/v1/farms
planting_cycles           → /api/v1/planting_cycles
weather_records           → /api/v1/weather_records
market_prices             → /api/v1/market_prices
knowledge_documents       → /api/v1/knowledge_documents
model_versions            → /api/v1/model_versions
observations              → /api/v1/observations
agent_runs                → /api/v1/agent_runs
```

### 2.2 建议额外实现的专用端点（已有 controller 框架）

```
仪表盘:
  GET  /dashboard/stats         → 返回统计数据（任务数/设备数/产量等聚合）
  GET  /dashboard/fields        → 返回地块状态列表
  GET  /dashboard/tasks/today   → 返回今日任务
  GET  /dashboard/alerts        → 返回未处理预警
  GET  /dashboard/environment   → 返回环境趋势数据

病虫害:
  GET  /disease/records         → 识别历史
  GET  /disease/knowledge       → 知识库
  GET  /disease/trend           → 趋势数据
  GET  /disease/knowledge/search?name=xx  → 搜索

精准农事:
  GET  /farming/irrigation      → 灌溉方案
  GET  /farming/fertilization   → 施肥方案
  GET  /farming/tasks           → 农事任务
  GET  /farming/fields          → 地块管理
  GET  /farming/stats           → 作业进度统计
  POST /farming/tasks           → 创建任务
  PUT  /farming/tasks/{id}      → 更新任务
  DELETE /farming/tasks/{id}    → 删除任务
  POST /farming/irrigation/{id}/execute → 执行灌溉

设备监控:
  GET  /devices                 → 设备列表
  GET  /devices/{id}            → 设备详情
  PUT  /devices/{id}            → 更新设备状态
  GET  /devices/stats           → 设备统计

溯源管理:
  GET  /products                → 产品列表
  POST /products                → 添加产品
  GET  /products/{id}/timeline  → 生产时间线
  GET  /products/{id}/quality   → 质检认证

权限管理:
  GET  /users                   → 用户列表
  POST /users                   → 创建用户
  PUT  /users/{id}              → 编辑用户
  DELETE /users/{id}            → 删除用户
  GET  /roles                   → 角色列表
  POST /roles                   → 创建角色
  GET  /logs                    → 操作日志

天气/市场/模型:
  GET  /weather/forecast        → 天气预报
  GET  /market/prices           → 市场价格
  GET  /monitor/models          → 模型版本
```

---

## 三、前端数据流

```
用户点击按钮
  → interactions-later.js 事件委托捕获 data-action
  → 调用对应的 handler 函数
  → handler 内部调用 dataService.insert/update/delete/getById...
  → dataService 先尝试 apiClient（后端 API，3s 超时）
  → API 失败 → 回退内存中 JSON 数据（data-service.js 内部 store）
  → 操作完成后调用 renderXxx() 刷新界面
  → UI.toast() 显示操作结果
```

**关键点**：所有增删改操作最终都走 `dataService`。同事接入后端后，只要后端 API 正常返回，`dataService` 自动走 API 路径；API 不可用时回退内存数据，前端不会白屏。

---

## 四、对接步骤

### 第 1 步：启动后端
```bash
cd backend
mvn spring-boot:run
# 后端启动在 localhost:9090
```

### 第 2 步：验证 API
```bash
# 测试通用 CRUD
curl http://localhost:9090/api/v1/users
curl http://localhost:9090/api/v1/farming_tasks
curl http://localhost:9090/api/v1/devices

# 测试专用端点
curl http://localhost:9090/api/v1/dashboard/stats
curl http://localhost:9090/api/v1/farming/irrigation
```

### 第 3 步：启动前端
```bash
cd frontend
python -m http.server 8000
# 访问 http://localhost:8000
```

### 第 4 步：确认切换
打开浏览器控制台，看到以下日志表示切换到 MySQL 模式：
```
[DataLoader] MySQL 模式：29/29 张表
```

如果看到：
```
[DataLoader] 回退到 JSON...
```
说明后端未启动或 API 返回格式不正确。

---

## 五、数据库表参考

每个表的结构参考 `frontend/data/` 目录下的同名 JSON 文件。例如：

- `farming_tasks.json`: id, type, fieldId, fieldCode, cropName, scheduledTime, estimatedDuration, status, assignedTo, priority, notes, completedAt
- `devices.json`: id, name, type, status, firmwareVersion, runHours, metrics{}, ...
- `alerts.json`: id, title, message, severity, isResolved, isRead, module, createdAt

前端新增操作写入的字段名与 JSON 文件中定义的字段名一致。

---

## 六、注意事项

1. **CORS**: 后端需要配置 CORS 允许 `localhost:8000` 跨域访问
2. **端口**: 前端硬编码 `localhost:9090`（`api-client.js:2`），如有改动需同步修改
3. **超时**: API 调用 3 秒超时（`api-client.js:42` `AbortSignal.timeout(3000)`），后端响应需在此时间内
4. **返回格式**: 所有 GET 返回 `[]` 数组（空表返回 `[]`，不要返回 null），POST/PUT 返回更新后的完整对象，DELETE 返回 `{ success: true }`
5. **前端不依赖 JWT**: 当前前端 mock 模式无需登录，同事可以后续接入 AuthController 的 JWT 认证
