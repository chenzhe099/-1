-- =====================================================
-- 智慧农业管理系统 — 初始种子数据
-- 与前端 data/*.json 保持一致
-- =====================================================

-- 角色
INSERT INTO roles (name, name_en, description, permissions) VALUES
('管理员', 'admin', '拥有系统全部权限', '{"dashboard":{"view":true,"edit":true},"disease":{"view":true,"edit":true},"farming":{"view":true,"edit":true},"prediction":{"view":true,"edit":true},"management":{"view":true,"edit":true},"devices":{"view":true,"edit":true},"traceability":{"view":true,"edit":true},"permission":{"view":true,"edit":true}}'),
('技术员', 'technician', '可查看和管理农事数据', '{"dashboard":{"view":true,"edit":false},"disease":{"view":true,"edit":true},"farming":{"view":true,"edit":true},"prediction":{"view":true,"edit":false},"management":{"view":true,"edit":true},"devices":{"view":true,"edit":true},"traceability":{"view":true,"edit":true},"permission":{"view":false,"edit":false}}'),
('农户', 'farmer', '查看基本信息，执行农事任务', '{"dashboard":{"view":true,"edit":false},"disease":{"view":true,"edit":false},"farming":{"view":true,"edit":false},"prediction":{"view":false,"edit":false},"management":{"view":true,"edit":false},"devices":{"view":true,"edit":false},"traceability":{"view":true,"edit":false},"permission":{"view":false,"edit":false}}'),
('合作社管理人员', 'manager', '查看生产数据、市场行情和风险预警', '{"dashboard":{"view":true,"edit":false},"disease":{"view":true,"edit":false},"farming":{"view":true,"edit":false},"prediction":{"view":true,"edit":false},"management":{"view":true,"edit":true},"devices":{"view":true,"edit":false},"traceability":{"view":true,"edit":true},"permission":{"view":false,"edit":false}}');

-- 用户 (密码均为 123456 的 BCrypt 加密)
INSERT INTO users (username, password_hash, display_name, role, avatar, status, phone, email) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 'admin', 'admin', 'active', '13800001001', 'admin@smartfarm.cn'),
('zhang_tech', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '张技术员', 'technician', 'Zhang', 'active', '13800001002', 'zhang@smartfarm.cn'),
('li_farmer', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '李农户', 'farmer', 'Li', 'active', '13800001003', 'li@smartfarm.cn'),
('yang_coop', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '杨社长', 'manager', 'Yang', 'active', '13800001007', 'yang@coop.cn');

-- 农场
INSERT INTO farms (name, address, manager_id, area, established_date, description) VALUES
('昆明绿色农业示范基地', '云南省昆明市呈贡区农业科技示范园', 1, 25.5, '2020-03-15', '主营番茄、黄瓜、辣椒、茄子、草莓等特色蔬菜水果种植'),
('大理高原特色农场', '云南省大理州大理市银桥镇', 4, 18.0, '2021-06-01', '高原特色农产品种植基地，海拔1800米');

-- 作物
INSERT INTO crops (name, category, growth_cycle_days, optimal_temp_min, optimal_temp_max, description) VALUES
('番茄', '蔬菜', 90, 18, 28, '茄科番茄属，富含维生素C'),
('黄瓜', '蔬菜', 75, 20, 30, '葫芦科黄瓜属，大棚主栽品种'),
('辣椒', '蔬菜', 100, 20, 30, '茄科辣椒属，云南特色品种'),
('茄子', '蔬菜', 110, 22, 30, '茄科茄属，紫长茄品种'),
('草莓', '水果', 95, 15, 25, '蔷薇科草莓属，红颜品种'),
('玉米', '粮食', 110, 18, 30, '禾本科玉米属，试验品种');

-- 地块
INSERT INTO fields (farm_id, code, name, crop_id, crop_name, area, status, soil_moisture, soil_ph, planted_date, expected_harvest, location_lat, location_lng) VALUES
(1, 'A1', '番茄种植区', 1, '番茄', 2.5, 'growing', 62, 6.5, '2023-11-01', '2024-01-30', 30.25, 120.18),
(1, 'A2', '黄瓜种植区', 2, '黄瓜', 2.0, 'growing', 68, 6.8, '2023-11-10', '2024-01-25', 30.26, 120.19),
(1, 'B1', '辣椒种植区', 3, '辣椒', 1.8, 'watering', 45, 6.3, '2023-10-15', '2024-02-05', 30.24, 120.20),
(1, 'B2', '茄子种植区', 4, '茄子', 2.2, 'growing', 60, 6.7, '2023-10-20', '2024-02-10', 30.25, 120.21),
(1, 'C1', '草莓种植区', 5, '草莓', 1.5, 'disease', 55, 5.8, '2023-11-15', '2024-02-15', 30.23, 120.17),
(2, 'C2', '玉米试验田', 6, '玉米', 3.0, 'fallow', 50, 6.5, '2024-02-01', '2024-04-30', 30.22, 120.16);

-- 设备
INSERT INTO devices (name, type, location, status, metrics, run_hours, last_maintenance, next_maintenance, ip_address, firmware_version) VALUES
('灌溉泵 #1', 'pump', 'field_a1', 'online', '{"flowRate":12,"unit":"m³/h"}', 1850, '2024-01-05', '2024-04-05', '192.168.1.101', 'v2.4.1'),
('智能施肥机 #1', 'fertilizer', 'field_a2', 'online', '{"fertilizedAmount":25,"unit":"kg"}', 2800, '2023-11-20', '2024-02-20', '192.168.1.102', 'v2.3.0'),
('环境监测站 #1', 'sensor', 'field_a1', 'online', '{"temperature":25,"humidity":62}', 4100, '2024-01-10', '2024-07-10', '192.168.1.104', 'v3.0.2'),
('气象站 #2', 'weather_station', NULL, 'offline', '{}', 5600, '2023-09-01', '2024-03-01', '192.168.1.105', 'v3.1.0');

-- 预警
INSERT INTO alerts (title, message, severity, module, is_resolved, is_read, action_required) VALUES
('病虫害预警', '地块C1草莓检测到白粉病风险，建议提前防治', 'warning', 'disease', FALSE, FALSE, '查看详情并安排防治'),
('设备故障', '灌溉泵 #3 水压异常，已自动停机', 'critical', 'devices', FALSE, FALSE, '立即安排维修'),
('天气预警', '预计本周末有降温降雨天气，请做好防寒排涝措施', 'info', 'weather', FALSE, FALSE, '通知农户做好防护');

-- 农事任务
INSERT INTO farming_tasks (type, field_id, field_code, crop_name, scheduled_time, estimated_duration, status, assigned_to, priority) VALUES
('watering', 1, 'A1', '番茄', '2024-01-15 08:30:00', 1.5, 'completed', 2, 'medium'),
('fertilizing', 3, 'B1', '辣椒', '2024-01-15 14:00:00', 2.0, 'pending', 2, 'high'),
('pruning', 2, 'A2', '黄瓜', '2024-01-16 09:00:00', 3.0, 'pending', 3, 'medium'),
('spraying', 5, 'C1', '草莓', '2024-01-16 10:00:00', 1.0, 'pending', 2, 'high');
