# 测试 (Tests)

## 测试策略

### 前端测试
- **Vitest** — 单元测试（组件、工具函数）
- **Playwright** — 端到端测试（用户流程模拟）

### 后端测试
- **JUnit** — Spring Boot 单元测试与集成测试
- **MockMvc** — API 接口测试

### AI 服务测试
- **Pytest** — Python 单元测试
- 模型效果评估：准确率、召回率、F1 分数
- 数据漂移检测测试
- RAG 检索质量评估

### 性能测试
- API 响应时间 < 500ms (P95)
- 图像识别延迟 < 3s
- 并发支持 ≥ 100 QPS

### 测试目录结构
```
tests/
├── frontend/         # 前端测试
├── backend/          # 后端测试
├── api/              # 接口测试
├── ai/               # AI 效果测试
└── performance/      # 性能测试
```
