# 部署指南

## 前置条件

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac)
2. 至少 8GB 可用内存
3. 端口 80, 8080, 8000, 3306, 6379 未被占用

## 快速启动 (Docker Compose)

### 1. 克隆仓库
```bash
git clone https://github.com/chenzhe099/-1.git
cd -1
```

### 2. 配置环境变量
```bash
copy .env.example .env
# 根据需要修改 .env 中的密码和密钥
```

### 3. 一键启动
```bash
docker compose -f deploy/docker-compose.yml up -d
```

### 4. 验证服务
| 服务 | 地址 |
|------|------|
| 前端 | http://localhost |
| 后端 API | http://localhost:8080/api/v1 |
| Swagger | http://localhost:8080/swagger-ui.html |
| AI 服务 | http://localhost:8000/docs |
| MinIO | http://localhost:9001 |

### 5. 初始化数据库 (首次)
```bash
# 进入 MySQL 容器执行迁移
docker exec -it smartfarm-mysql mysql -uroot -psmartfarm123 smartfarm < docs/database/migrations/V1__init_schema.sql
docker exec -it smartfarm-mysql mysql -uroot -psmartfarm123 smartfarm < docs/database/migrations/V2__seed_data.sql
docker exec -it smartfarm-mysql mysql -uroot -psmartfarm123 smartfarm < docs/database/migrations/V3__add_indexes.sql
```

### 6. 登录
浏览器打开 http://localhost，使用:
- 用户名: `admin`
- 密码: `123456`

## 本地开发 (不依赖 Docker)

### 后端 (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
# 需要: JDK 21 + MySQL 8.0
```

### AI 服务 (FastAPI)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# 需要: Python 3.11+
```

### 前端
```bash
cd frontend
python -m http.server 80
# 或直接浏览器打开 index.html (使用本地 DataService 模式)
```

## 服务端口映射

| 服务 | 端口 |
|------|------|
| Nginx (前端) | 80 |
| Spring Boot | 8080 |
| FastAPI | 8000 |
| MySQL | 3306 |
| Redis | 6379 |
| MinIO | 9000/9001 |

## 常用命令

```bash
# 查看日志
docker compose -f deploy/docker-compose.yml logs -f backend

# 重启服务
docker compose -f deploy/docker-compose.yml restart ai-service

# 停止所有服务
docker compose -f deploy/docker-compose.yml down

# 清理并重建
docker compose -f deploy/docker-compose.yml down -v
docker compose -f deploy/docker-compose.yml up -d --build
```
