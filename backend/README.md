# 业务后端 (Backend)

## 技术栈
- **Spring Boot 3.2** — Java 业务后端框架
- **Spring Security + JWT** — 用户认证与授权（RBAC）
- **Spring Data JPA** — ORM 数据访问层
- **H2 / MySQL** — 关系数据库（开发用 H2 内存库，生产切 MySQL）
- **Flyway** — 数据库迁移管理
- **SpringDoc OpenAPI** — Swagger 接口文档自动生成
- **Lombok** — 减少样板代码

## 项目结构

```
backend/
├── pom.xml
└── src/main/java/com/smartfarm/
    ├── SmartFarmApplication.java    # 启动类
    ├── config/
    │   ├── SecurityConfig.java      # Spring Security 配置
    │   ├── SwaggerConfig.java       # Swagger 文档配置
    │   └── DataInitializer.java     # 开发环境演示数据初始化
    ├── security/
    │   ├── JwtUtil.java             # JWT 令牌工具
    │   ├── JwtAuthenticationFilter.java  # JWT 认证过滤器
    │   ├── CustomUserDetails.java   # 用户详情（实现 UserDetails）
    │   └── CustomUserDetailsService.java # 用户加载服务
    ├── entity/        (27 个实体类)  # JPA 实体，映射数据库表
    ├── repository/    (27 个接口)    # Spring Data JPA 数据访问
    ├── dto/           (18 个类)      # 数据传输对象
    ├── service/       (8 个类)       # 业务逻辑层
    ├── controller/    (8 个类)       # REST API 控制器
    ├── exception/     (3 个类)       # 全局异常处理
    └── util/                         # 工具类
```

## 快速启动

### 方式一：Maven（需要 Java 17+）

```bash
cd backend

# Windows
mvnw.cmd spring-boot:run

# Mac/Linux
./mvnw spring-boot:run
```

### 方式二：IDE 导入

1. IntelliJ IDEA → File → Open → 选择 `backend/` 目录
2. 等待 Maven 依赖下载完成
3. 运行 `SmartFarmApplication.java`

## 默认配置

启动后自动使用 **H2 内存数据库**，无需安装 MySQL。

- **应用端口**: http://localhost:8080
- **Swagger 文档**: http://localhost:8080/swagger-ui.html
- **H2 控制台**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:smartfarm`
  - 用户名: `sa`，密码: 空

## 演示账户

系统启动后自动创建以下账户（密码均为 `123456`）：

| 用户名 | 角色 | 权限 |
|--------|------|------|
| `admin` | 管理员 | 全部权限 |
| `zhang_tech` | 技术员 | 查看+编辑农事/设备 |
| `li_farmer` | 农户 | 查看基本信息 |
| `yang_coop` | 合作社管理人员 | 查看生产+市场行情 |

## API 接口一览

### 认证管理 `/api/auth`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/register` | 用户注册 |

### 数据总览 `/api/dashboard`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/dashboard/stats` | 仪表盘统计数据 |
| GET | `/api/dashboard/fields` | 地块状态列表 |
| GET | `/api/dashboard/tasks/today` | 今日农事任务 |
| GET | `/api/dashboard/alerts` | 活跃预警 |

### 用户管理 `/api/users`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/users` | 用户列表 |
| GET/PUT/DELETE | `/api/users/{id}` | 用户 CRUD |
| PUT | `/api/users/{id}/reset-password` | 重置密码（管理员） |

### 农场与地块 `/api/farms`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/farms` | 农场列表/创建 |
| GET/PUT/DELETE | `/api/farms/{id}` | 农场 CRUD |
| GET | `/api/farms/{id}/fields` | 农场下属地块 |
| POST | `/api/farms/fields` | 创建地块 |
| GET | `/api/farms/{id}/cycles` | 种植周期 |
| GET | `/api/farms/cycles/active` | 活跃种植周期 |

### 农事任务 `/api/tasks`
### 设备管理 `/api/devices`
### 病虫害识别 `/api/disease`
### 溯源管理 `/api/traceability`
### 天气监测 `/api/weather`
### 市场价格 `/api/market`
### 模型监控 `/api/monitor`
### 预警管理 `/api/alerts`

完整 API 文档请启动后访问 Swagger UI。

## 数据库表（27 张）

users, roles, farms, fields, crops, planting_cycles,
farming_tasks, devices, maintenance_records,
irrigation_plans, fertilization_plans,
disease_records, pest_knowledge_base,
products, production_timeline, quality_certifications,
yield_predictions, environment_readings, soil_readings,
weather_records, market_prices,
knowledge_documents, model_versions,
alerts, operation_logs, inventory, personnel

## 切换 MySQL

修改 `application.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/smartfarm?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: smartfarm123
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
  flyway:
    enabled: true
```

数据库迁移脚本位于 `src/main/resources/db/migration/`。
