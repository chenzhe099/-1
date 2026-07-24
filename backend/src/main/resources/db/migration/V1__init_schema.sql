-- =====================================================
-- 智慧农业管理系统 — 数据库初始化脚本
-- 云南特色农业智能诊断与生产管理平台
-- MySQL 5.7+ / H2 兼容
-- =====================================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'farmer' COMMENT 'admin/technician/farmer/manager',
    avatar VARCHAR(50) DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT 'active/disabled',
    phone VARCHAR(20) DEFAULT '',
    email VARCHAR(100) DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 角色表
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    name_en VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) DEFAULT '',
    permissions TEXT COMMENT 'JSON权限配置'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 农场表
CREATE TABLE IF NOT EXISTS farms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) DEFAULT '',
    manager_id BIGINT,
    area DOUBLE DEFAULT 0 COMMENT '总面积(亩)',
    established_date DATE,
    description TEXT,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_farms_manager (manager_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='农场表';

-- 作物品种表
CREATE TABLE IF NOT EXISTS crops (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(30) DEFAULT '',
    growth_cycle_days INT DEFAULT 0,
    optimal_temp_min DOUBLE DEFAULT 15,
    optimal_temp_max DOUBLE DEFAULT 30,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作物品种表';

-- 地块表
CREATE TABLE IF NOT EXISTS fields (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farm_id BIGINT,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(100) DEFAULT '',
    crop_id BIGINT,
    crop_name VARCHAR(50) DEFAULT '',
    area DOUBLE DEFAULT 0 COMMENT '面积(亩)',
    status VARCHAR(20) DEFAULT 'fallow' COMMENT 'growing/watering/disease/fallow',
    soil_moisture INT DEFAULT 0,
    soil_ph DOUBLE DEFAULT 7.0,
    planted_date DATE,
    expected_harvest DATE,
    location_lat DOUBLE DEFAULT 0,
    location_lng DOUBLE DEFAULT 0,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL,
    INDEX idx_fields_farm (farm_id),
    INDEX idx_fields_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地块表';

-- 种植周期表
CREATE TABLE IF NOT EXISTS planting_cycles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    field_id BIGINT,
    farm_id BIGINT,
    crop_id BIGINT,
    crop_name VARCHAR(50) DEFAULT '',
    planted_date DATE,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    yield_tons DOUBLE,
    quality_grade VARCHAR(10),
    growth_stage VARCHAR(20) DEFAULT '',
    notes TEXT,
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE,
    FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL,
    INDEX idx_cycles_field (field_id),
    INDEX idx_cycles_farm (farm_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='种植周期表';

-- 农事任务表
CREATE TABLE IF NOT EXISTS farming_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20) NOT NULL COMMENT 'watering/fertilizing/spraying/pruning/harvesting/thinning',
    field_id BIGINT,
    field_code VARCHAR(10) DEFAULT '',
    crop_name VARCHAR(50) DEFAULT '',
    scheduled_time DATETIME,
    estimated_duration DOUBLE DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending/in_progress/completed/cancelled',
    assigned_to BIGINT,
    priority VARCHAR(10) DEFAULT 'medium' COMMENT 'high/medium/low',
    notes TEXT,
    completed_at DATETIME,
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_tasks_field (field_id),
    INDEX idx_tasks_status (status),
    INDEX idx_tasks_time (scheduled_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='农事任务表';

-- 设备表
CREATE TABLE IF NOT EXISTS devices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) DEFAULT '' COMMENT 'pump/fertilizer/sensor/weather_station/controller',
    location VARCHAR(50) DEFAULT '',
    status VARCHAR(20) DEFAULT 'offline' COMMENT 'online/offline/fault/standby',
    metrics TEXT COMMENT 'JSON运行指标',
    run_hours INT DEFAULT 0,
    last_maintenance DATE,
    next_maintenance DATE,
    ip_address VARCHAR(20) DEFAULT '',
    firmware_version VARCHAR(20) DEFAULT '',
    INDEX idx_devices_status (status),
    INDEX idx_devices_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备表';

-- 维护记录表
CREATE TABLE IF NOT EXISTS maintenance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT,
    type VARCHAR(30) DEFAULT '',
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending/in_progress/completed',
    scheduled_date DATE,
    completed_date DATE,
    technician_id BIGINT,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_maintenance_device (device_id),
    INDEX idx_maintenance_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备维护记录';

-- 灌溉方案表
CREATE TABLE IF NOT EXISTS irrigation_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    field_id BIGINT,
    field_code VARCHAR(10) DEFAULT '',
    crop_name VARCHAR(50) DEFAULT '',
    target_moisture INT DEFAULT 65,
    current_moisture INT DEFAULT 0,
    water_volume DOUBLE DEFAULT 0 COMMENT 'm³',
    estimated_duration INT DEFAULT 0 COMMENT '分钟',
    status VARCHAR(20) DEFAULT 'planned' COMMENT 'planned/executing/completed',
    scheduled_at DATETIME,
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE SET NULL,
    INDEX idx_irrigation_field (field_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='灌溉方案表';

-- 施肥方案表
CREATE TABLE IF NOT EXISTS fertilization_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    field_id BIGINT,
    field_code VARCHAR(10) DEFAULT '',
    crop_name VARCHAR(50) DEFAULT '',
    n_kg DOUBLE DEFAULT 0,
    p_kg DOUBLE DEFAULT 0,
    k_kg DOUBLE DEFAULT 0,
    organic_kg DOUBLE DEFAULT 0,
    status VARCHAR(20) DEFAULT 'planned' COMMENT 'planned/completed',
    scheduled_at DATETIME,
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE SET NULL,
    INDEX idx_fert_field (field_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='施肥方案表';

-- 病虫害记录表
CREATE TABLE IF NOT EXISTS disease_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    field_id BIGINT,
    field_code VARCHAR(10) DEFAULT '',
    disease_name VARCHAR(100) DEFAULT '',
    crop_affected VARCHAR(50) DEFAULT '',
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    severity VARCHAR(10) DEFAULT 'medium' COMMENT 'low/medium/high/critical',
    status VARCHAR(20) DEFAULT 'processing' COMMENT 'processing/resolved',
    image_url VARCHAR(500) DEFAULT '',
    treatment_plan TEXT,
    resolved_at DATETIME,
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE SET NULL,
    INDEX idx_disease_field (field_id),
    INDEX idx_disease_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='病虫害记录';

-- 病虫害知识库
CREATE TABLE IF NOT EXISTS pest_knowledge_base (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(100) DEFAULT '',
    icon VARCHAR(30) DEFAULT 'fa-bug',
    symptoms TEXT,
    causes TEXT,
    treatment TEXT,
    severity VARCHAR(10) DEFAULT 'medium',
    regulation VARCHAR(500) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='病虫害知识库';

-- 产品表
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    field_id BIGINT,
    name VARCHAR(100) DEFAULT '',
    batch_number VARCHAR(50) DEFAULT '',
    quantity_tons DOUBLE DEFAULT 0,
    harvest_date DATE,
    trace_status VARCHAR(20) DEFAULT 'pending_trace' COMMENT 'traced/pending_trace',
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE SET NULL,
    INDEX idx_products_field (field_id),
    INDEX idx_products_batch (batch_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品表';

-- 生产时间线
CREATE TABLE IF NOT EXISTS production_timeline (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT,
    stage VARCHAR(50) DEFAULT '',
    date DATETIME,
    location VARCHAR(100) DEFAULT '',
    description TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_timeline_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产时间线';

-- 质量认证
CREATE TABLE IF NOT EXISTS quality_certifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT,
    name VARCHAR(100) DEFAULT '',
    result VARCHAR(20) DEFAULT 'pending' COMMENT 'pass/fail/pending',
    cert_number VARCHAR(50) DEFAULT '',
    test_date DATE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_cert_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质量认证';

-- 产量预测
CREATE TABLE IF NOT EXISTS yield_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    month VARCHAR(7) NOT NULL COMMENT 'YYYY-MM',
    crop_name VARCHAR(50) DEFAULT '',
    predicted DOUBLE DEFAULT 0,
    actual DOUBLE,
    confidence DOUBLE DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产量预测';

-- 环境监测读数
CREATE TABLE IF NOT EXISTS environment_readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    temperature DOUBLE DEFAULT 0,
    humidity DOUBLE DEFAULT 0,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    INDEX idx_env_device_time (device_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='环境监测读数';

-- 土壤监测读数
CREATE TABLE IF NOT EXISTS soil_readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    field_id BIGINT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    moisture INT DEFAULT 0,
    n_level INT DEFAULT 0,
    p_level INT DEFAULT 0,
    k_level INT DEFAULT 0,
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE,
    INDEX idx_soil_field_time (field_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='土壤监测读数';

-- 天气记录
CREATE TABLE IF NOT EXISTS weather_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    location VARCHAR(50) DEFAULT '昆明',
    temperature_high DOUBLE DEFAULT 0,
    temperature_low DOUBLE DEFAULT 0,
    humidity INT DEFAULT 0,
    rainfall_mm DOUBLE DEFAULT 0,
    wind_speed DOUBLE DEFAULT 0,
    condition VARCHAR(20) DEFAULT '' COMMENT 'sunny/cloudy/rain/snow',
    forecast TEXT,
    UNIQUE KEY uk_weather_date_loc (date, location),
    INDEX idx_weather_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='天气记录';

-- 市场价格
CREATE TABLE IF NOT EXISTS market_prices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    crop_name VARCHAR(50) NOT NULL,
    price_per_kg DOUBLE DEFAULT 0,
    unit VARCHAR(20) DEFAULT '元/公斤',
    market VARCHAR(100) DEFAULT '',
    date DATE NOT NULL,
    change_percent DOUBLE DEFAULT 0,
    trend VARCHAR(10) DEFAULT 'stable' COMMENT 'up/down/stable',
    INDEX idx_price_crop_date (crop_name, date),
    INDEX idx_price_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='市场价格';

-- 知识文档（农技规范）
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(30) DEFAULT '' COMMENT 'disease/pest/irrigation/fertilizer/other',
    crop_target VARCHAR(50) DEFAULT '多作物',
    original_text TEXT,
    source_regulation VARCHAR(200) DEFAULT '',
    keywords TEXT COMMENT 'JSON数组',
    publish_date DATE,
    INDEX idx_knowledge_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识文档表';

-- 模型版本
CREATE TABLE IF NOT EXISTS model_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    deployed_at DATETIME,
    accuracy DOUBLE,
    drift_score DOUBLE,
    status VARCHAR(20) DEFAULT 'inactive' COMMENT 'active/inactive/deprecated',
    total_predictions INT DEFAULT 0,
    unknown_rate DOUBLE,
    description TEXT,
    INDEX idx_model_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI模型版本';

-- 预警表
CREATE TABLE IF NOT EXISTS alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    severity VARCHAR(10) DEFAULT 'info' COMMENT 'critical/warning/info',
    module VARCHAR(30) DEFAULT '',
    is_resolved BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    action_required VARCHAR(200) DEFAULT '',
    INDEX idx_alerts_resolved (is_resolved),
    INDEX idx_alerts_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预警表';

-- 操作日志
CREATE TABLE IF NOT EXISTS operation_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(50) DEFAULT '',
    module VARCHAR(30) DEFAULT '',
    action VARCHAR(100) DEFAULT '',
    detail TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_logs_user (user_id),
    INDEX idx_logs_time (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志';

-- 库存
CREATE TABLE IF NOT EXISTS inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(30) DEFAULT '',
    quantity DOUBLE DEFAULT 0,
    unit VARCHAR(20) DEFAULT '',
    threshold_low DOUBLE DEFAULT 0,
    supplier VARCHAR(100) DEFAULT '',
    last_restocked DATE,
    status VARCHAR(20) DEFAULT 'sufficient' COMMENT 'sufficient/low/depleted'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存表';

-- 人员
CREATE TABLE IF NOT EXISTS personnel (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    role VARCHAR(30) DEFAULT '',
    avatar VARCHAR(30) DEFAULT '',
    status VARCHAR(20) DEFAULT 'on_duty' COMMENT 'on_duty/off_duty/leave',
    phone VARCHAR(20) DEFAULT '',
    email VARCHAR(100) DEFAULT '',
    joined_at DATE,
    INDEX idx_personnel_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='人员表';
