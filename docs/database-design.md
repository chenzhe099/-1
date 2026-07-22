# 数据库设计文档

## 概述

- **数据库**: MySQL 8.0
- **字符集**: utf8mb4 (支持中文)
- **引擎**: InnoDB (支持事务和外键)
- **表总数**: 27张

## 核心表关系

```
roles ──┐
        ├── users ──── operation_logs
        │     │
farms ──┤     ├── alerts
        │     │
crops ──┤     ├── farming_tasks
        │     │
fields ─┼─────┼── irrigation_plans
        │     ├── fertilization_plans
        │     ├── disease_records
        │     ├── soil_readings
        │     ├── planting_cycles
        │     └── products ── production_timeline
        │                    ── quality_certifications
devices ─── maintenance_records
        └── environment_readings
```

## 表结构概览

| 表名 | 说明 | 主键 | 行数(种子) |
|------|------|------|-----------|
| roles | 角色定义 | id | 4 |
| users | 用户 | id | 8 |
| farms | 农场 | id | 2 |
| crops | 作物 | id | 5 |
| fields | 地块 | id | 6 |
| farming_tasks | 农事任务 | id | 12 |
| devices | IoT设备 | id | 8 |
| irrigation_plans | 灌溉计划 | id | 4 |
| fertilization_plans | 施肥计划 | id | 4 |
| maintenance_records | 维护记录 | id | 6 |
| disease_records | 病害记录 | id | 5 |
| pest_knowledge_base | 病虫害知识库 | id | 6 |
| products | 产品 | id | 6 |
| production_timeline | 生产时间线 | id | 24 |
| quality_certifications | 质量认证 | id | 18 |
| yield_predictions | 产量预测 | id | 12 |
| environment_readings | 环境读数 | id | 24 |
| soil_readings | 土壤读数 | id | 12 |
| alerts | 预警信息 | id | 6 |
| operation_logs | 操作日志 | id | 8 |
| inventory | 库存 | id | 6 |
| personnel | 人员 | id | 5 |
| planting_cycles | 种植周期 | id | 6 |
| weather_records | 天气记录 | id | 14 |
| market_prices | 市场价格 | id | 36 |
| knowledge_documents | 知识文档 | id | 8 |
| model_versions | 模型版本 | id | 6 |

## 索引策略

- 外键列均有索引以加速 JOIN 查询
- `isResolved`, `status` 等过滤字段建索引
- `timestamp`, `createdAt`, `date` 时间字段建索引以支持时序查询
- `username` 建唯一索引保证登录查找效率

## 迁移脚本

- `V1__init_schema.sql` — 建库建表
- `V2__seed_data.sql` — 种子数据
- `V3__add_indexes.sql` — 索引优化
