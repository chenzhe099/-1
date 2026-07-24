-- V2: 种子数据
-- 从 frontend/data/*.json 自动生成

USE smartfarm;

-- Table: roles (4 rows)
INSERT INTO `roles` (`id`, `name`, `nameEn`, `description`, `permissions`) VALUES
  ('admin', '管理员', 'Admin', '拥有系统全部权限，可管理用户、角色、系统配置', '{"dashboard": {"view": true, "edit": true}, "disease": {"view": true, "edit": true}, "farming": {"view": true, "edit": true}, "prediction": {"view": true, "edit": true}, "management": {"view": true, "edit": true}, "devices": {"view": true, "edit": true}, "traceability": {"view": true, "edit": true}, "permission": {"view": true, "edit": true}}'),
  ('technician', '技术员', 'Technician', '可查看和管理农事数据，操作设备，查看分析报告', '{"dashboard": {"view": true, "edit": false}, "disease": {"view": true, "edit": true}, "farming": {"view": true, "edit": true}, "prediction": {"view": true, "edit": false}, "management": {"view": true, "edit": true}, "devices": {"view": true, "edit": true}, "traceability": {"view": true, "edit": true}, "permission": {"view": false, "edit": false}}'),
  ('farmer', '农户', 'Farmer', '查看基本信息和执行分配的农事任务', '{"dashboard": {"view": true, "edit": false}, "disease": {"view": true, "edit": false}, "farming": {"view": true, "edit": false}, "prediction": {"view": false, "edit": false}, "management": {"view": true, "edit": false}, "devices": {"view": true, "edit": false}, "traceability": {"view": true, "edit": false}, "permission": {"view": false, "edit": false}, "weather": {"view": true, "edit": false}, "market": {"view": true, "edit": false}, "monitor": {"view": false, "edit": false}}'),
  ('manager', '合作社管理人员', 'Cooperative Manager', '查看生产数据、市场行情和风险预警，管理合作社成员', '{"dashboard": {"view": true, "edit": false}, "disease": {"view": true, "edit": false}, "farming": {"view": true, "edit": false}, "prediction": {"view": true, "edit": false}, "management": {"view": true, "edit": true}, "devices": {"view": true, "edit": false}, "traceability": {"view": true, "edit": true}, "permission": {"view": false, "edit": false}, "weather": {"view": true, "edit": false}, "market": {"view": true, "edit": false}, "monitor": {"view": true, "edit": false}}');

-- Table: users (8 rows)
INSERT INTO `users` (`id`, `username`, `displayName`, `role`, `avatar`, `status`, `phone`, `email`, `createdAt`, `lastLogin`) VALUES
  ('u001', 'admin', '系统管理员', 'admin', 'admin', 'active', '13800001001', 'admin@smartfarm.cn', '2023-06-01', '2024-01-15 14:30'),
  ('u002', 'zhang_tech', '张技术员', 'technician', 'Zhang', 'active', '13800001002', 'zhang@smartfarm.cn', '2023-08-15', '2024-01-15 10:00'),
  ('u003', 'li_farmer', '李农户', 'farmer', 'Li', 'active', '13800001003', 'li@smartfarm.cn', '2023-09-01', '2024-01-14 16:45'),
  ('u004', 'wang_admin', '王管理员', 'admin', 'Wang', 'disabled', '13800001004', 'wang@smartfarm.cn', '2023-07-20', '2023-12-20 09:15'),
  ('u005', 'chen_tech', '陈技术员', 'technician', 'Chen', 'active', '13800001005', 'chen@smartfarm.cn', '2023-10-10', '2024-01-15 11:20'),
  ('u006', 'zhao_farmer', '赵农户', 'farmer', 'Zhao', 'active', '13800001006', 'zhao@smartfarm.cn', '2023-11-01', '2024-01-15 08:00'),
  ('u007', 'yang_coop', '杨社长', 'manager', 'Yang', 'active', '13800001007', 'yang@coop.cn', '2023-09-15', '2024-01-15 09:30'),
  ('u008', 'ma_manager', '马经理', 'manager', 'Ma', 'active', '13800001008', 'ma@coop.cn', '2023-10-20', '2024-01-14 15:00');

-- Table: farms (2 rows)
INSERT INTO `farms` (`id`, `name`, `address`, `managerId`, `area`, `establishedDate`, `description`) VALUES
  ('farm_01', '昆明绿色农业示范基地', '云南省昆明市呈贡区农业科技示范园', 'u001', 25.5, '2020-03-15', '主营番茄、黄瓜、辣椒、茄子、草莓等特色蔬菜水果种植，采用智能灌溉和精准施肥技术'),
  ('farm_02', '大理高原特色农场', '云南省大理州大理市银桥镇', 'u004', 18.0, '2021-06-01', '高原特色农产品种植基地，主产高原蔬菜和特色水果，海拔1800米');

-- Table: crops (5 rows)
INSERT INTO `crops` (`id`, `name`, `nameEn`, `category`, `growthDays`, `optimalTempMin`, `optimalTempMax`, `optimalHumidity`, `icon`) VALUES
  ('crop_tomato', '番茄', 'Tomato', 'vegetable', 90, 20, 28, 65, 'fa-apple'),
  ('crop_cucumber', '黄瓜', 'Cucumber', 'vegetable', 70, 22, 30, 70, 'fa-leaf'),
  ('crop_pepper', '辣椒', 'Pepper', 'vegetable', 100, 18, 32, 60, 'fa-fire'),
  ('crop_eggplant', '茄子', 'Eggplant', 'vegetable', 110, 22, 30, 65, 'fa-circle'),
  ('crop_strawberry', '草莓', 'Strawberry', 'fruit', 85, 15, 25, 70, 'fa-heart');

-- Table: fields (6 rows)
INSERT INTO `fields` (`id`, `code`, `name`, `cropId`, `cropName`, `area`, `status`, `soilMoisture`, `soilPh`, `plantedDate`, `expectedHarvest`, `location`) VALUES
  ('field_a1', 'A1', '番茄种植区', 'crop_tomato', '番茄', 2.5, 'growing', 62, 6.5, '2023-11-01', '2024-01-30', '{"lat": 30.25, "lng": 120.18}'),
  ('field_a2', 'A2', '黄瓜种植区', 'crop_cucumber', '黄瓜', 2.0, 'growing', 68, 6.8, '2023-11-10', '2024-01-25', '{"lat": 30.26, "lng": 120.19}'),
  ('field_b1', 'B1', '辣椒种植区', 'crop_pepper', '辣椒', 1.8, 'watering', 45, 6.3, '2023-10-15', '2024-02-05', '{"lat": 30.24, "lng": 120.2}'),
  ('field_b2', 'B2', '茄子种植区', 'crop_eggplant', '茄子', 2.2, 'growing', 60, 6.7, '2023-10-20', '2024-02-10', '{"lat": 30.25, "lng": 120.21}'),
  ('field_c1', 'C1', '草莓种植区', 'crop_strawberry', '草莓', 1.5, 'disease', 55, 5.8, '2023-11-15', '2024-02-15', '{"lat": 30.23, "lng": 120.17}'),
  ('field_c2', 'C2', '玉米试验田', 'crop_tomato', '番茄（轮作）', 3.0, 'fallow', 50, 6.5, '2024-02-01', '2024-04-30', '{"lat": 30.22, "lng": 120.16}');

-- Table: farming_tasks (12 rows)
INSERT INTO `farming_tasks` (`id`, `type`, `fieldId`, `fieldCode`, `cropName`, `scheduledTime`, `estimatedDuration`, `status`, `assignedTo`, `priority`, `notes`, `completedAt`) VALUES
  ('task_01', 'watering', 'field_a1', 'A1', '番茄', '2024-01-15 08:30', 1.5, 'in_progress', 'u002', 'high', '土壤湿度偏低，需浇灌15m³', NULL),
  ('task_02', 'pruning', 'field_a2', 'A2', '黄瓜', '2024-01-15 10:30', 1.5, 'pending', 'u003', 'medium', '修剪侧枝和枯叶', NULL),
  ('task_03', 'spraying', 'field_b1', 'B1', '辣椒', '2024-01-15 14:00', 1.5, 'pending', 'u006', 'high', '预防性喷洒低毒杀虫剂', NULL),
  ('task_04', 'fertilizing', 'field_c1', 'C1', '草莓', '2024-01-15 15:30', 1.5, 'pending', 'u003', 'medium', '追施钾肥和有机肥', NULL),
  ('task_05', 'watering', 'field_a1', 'A1', '番茄', '2024-01-14 08:30', 1.0, 'completed', 'u002', 'medium', '日常浇灌', '2024-01-14 10:00'),
  ('task_06', 'spraying', 'field_b1', 'B1', '辣椒', '2024-01-14 14:00', 1.5, 'completed', 'u006', 'high', '杀虫剂喷洒', '2024-01-14 15:30'),
  ('task_07', 'fertilizing', 'field_b1', 'B1', '辣椒', '2024-01-16 14:00', 2.0, 'pending', 'u003', 'medium', '追施钾肥15kg', NULL),
  ('task_08', 'thinning', 'field_c1', 'C1', '草莓', '2024-01-16 09:00', 4.0, 'pending', 'u002', 'medium', '疏果和摘除病叶', NULL),
  ('task_09', 'pruning', 'field_a2', 'A2', '黄瓜', '2024-01-16 14:00', 1.5, 'pending', 'u003', 'low', '二次修剪', NULL),
  ('task_10', 'harvesting', 'field_a1', 'A1', '番茄', '2024-01-20 08:00', 6.0, 'pending', 'u006', 'high', '预计采收45吨', NULL);
INSERT INTO `farming_tasks` (`id`, `type`, `fieldId`, `fieldCode`, `cropName`, `scheduledTime`, `estimatedDuration`, `status`, `assignedTo`, `priority`, `notes`, `completedAt`) VALUES
  ('task_11', 'harvesting', 'field_a2', 'A2', '黄瓜', '2024-01-22 08:00', 5.0, 'pending', 'u003', 'high', '预计采收32吨', NULL),
  ('task_12', 'fertilizing', 'field_b1', 'B1', '辣椒', '2024-01-16 08:00', 1.0, 'completed', 'u006', 'medium', '氮肥追施10kg', '2024-01-16 09:15');

-- Table: irrigation_plans (4 rows)
INSERT INTO `irrigation_plans` (`id`, `fieldId`, `fieldCode`, `cropName`, `targetMoisture`, `currentMoisture`, `waterVolume`, `estimatedDuration`, `status`, `scheduledAt`, `executedAt`) VALUES
  ('irr_01', 'field_a1', 'A1', '番茄', 65, 62, 15, 30, 'executing', '2024-01-15 08:30', NULL),
  ('irr_02', 'field_b1', 'B1', '辣椒', 70, 45, 22, 45, 'pending', '2024-01-15 14:00', NULL),
  ('irr_03', 'field_a2', 'A2', '黄瓜', 68, 68, 10, 20, 'completed', '2024-01-14 08:00', '2024-01-14 08:30'),
  ('irr_04', 'field_c1', 'C1', '草莓', 65, 55, 12, 25, 'planned', '2024-01-16 09:00', NULL);

-- Table: fertilization_plans (4 rows)
INSERT INTO `fertilization_plans` (`id`, `fieldId`, `fieldCode`, `cropName`, `nKg`, `pKg`, `kKg`, `organicKg`, `status`, `scheduledAt`, `executedAt`) VALUES
  ('fert_01', 'field_a2', 'A2', '黄瓜', 15, 8, 12, 30, 'completed', '2024-01-15 08:00', '2024-01-15 08:45'),
  ('fert_02', 'field_c1', 'C1', '草莓', 10, 5, 15, 20, 'planned', '2024-01-18 09:00', NULL),
  ('fert_03', 'field_a1', 'A1', '番茄', 20, 10, 18, 40, 'completed', '2024-01-10 08:00', '2024-01-10 09:00'),
  ('fert_04', 'field_b1', 'B1', '辣椒', 0, 0, 0, 0, 'planned', NULL, NULL);

-- Table: devices (8 rows)
INSERT INTO `devices` (`id`, `name`, `type`, `location`, `status`, `metrics`, `runHours`, `lastMaintenance`, `nextMaintenance`, `ipAddress`, `firmwareVersion`) VALUES
  ('dev_01', '灌溉泵 #1', 'pump', 'field_a1', 'online', '{"flowRate": 12, "unit": "m³/h", "currentTask": "A1定时浇灌"}', 1850, '2024-01-05', '2024-04-05', '192.168.1.101', 'v2.4.1'),
  ('dev_02', '智能施肥机 #1', 'fertilizer', 'field_a2', 'online', '{"fertilizedAmount": 25, "unit": "kg", "currentTask": "A2施肥"}', 2800, '2023-11-20', '2024-02-20', '192.168.1.102', 'v2.3.0'),
  ('dev_03', '灌溉泵 #3', 'pump', 'field_b1', 'fault', '{"flowRate": 0, "unit": "m³/h", "error": "水压异常"}', 3200, '2023-10-15', '2024-01-15', '192.168.1.103', 'v2.4.1'),
  ('dev_04', '环境监测站 #1', 'sensor', 'field_a1', 'online', '{"temperature": 25, "humidity": 62, "unit": "°C / %"}', 4100, '2024-01-10', '2024-07-10', '192.168.1.104', 'v3.0.2'),
  ('dev_05', '气象站 #2', 'weather_station', NULL, 'offline', '{"temperature": null, "windSpeed": null}', 5600, '2023-09-01', '2024-03-01', '192.168.1.105', 'v3.1.0'),
  ('dev_06', '智能温室控制器', 'controller', 'field_c1', 'online', '{"temperature": 25, "humidity": 70, "co2": 420, "unit": "°C / % / ppm"}', 2100, '2023-12-15', '2024-06-15', '192.168.1.106', 'v4.0.0'),
  ('dev_07', '土壤传感器 #1', 'sensor', 'field_b1', 'online', '{"moisture": 65, "ph": 6.3, "unit": "% / pH"}', 3900, '2024-01-08', '2024-07-08', '192.168.1.107', 'v3.0.2'),
  ('dev_08', '智能施肥机 #2', 'fertilizer', 'field_c1', 'standby', '{"fertilizedAmount": 0, "unit": "kg", "nextTask": "等待排程"}', 1200, '2023-12-01', '2024-06-01', '192.168.1.108', 'v2.3.0');

-- Table: maintenance_records (6 rows)
INSERT INTO `maintenance_records` (`id`, `deviceId`, `deviceName`, `type`, `status`, `scheduledDate`, `completedDate`, `technicianNote`, `cost`) VALUES
  ('maint_01', 'dev_03', '灌溉泵 #3', 'repair', 'pending', '2024-01-20', NULL, '水压异常，需检查泵体和管路，运行时间已达3200小时', 0),
  ('maint_02', 'dev_02', '智能施肥机 #1', 'inspection', 'pending', '2024-02-20', NULL, '常规保养，运行时间2800小时，需更换滤网', 0),
  ('maint_03', 'dev_04', '环境监测站 #1', 'calibration', 'completed', '2024-01-10', '2024-01-10', '温度、湿度传感器校准完成', 500),
  ('maint_04', 'dev_01', '灌溉泵 #1', 'inspection', 'completed', '2024-01-05', '2024-01-05', '水泵运行正常，更换密封圈', 800),
  ('maint_05', 'dev_05', '气象站 #2', 'repair', 'pending', '2024-01-18', NULL, '通信模块故障，需更换无线模块', 0),
  ('maint_06', 'dev_07', '土壤传感器 #1', 'calibration', 'completed', '2024-01-08', '2024-01-08', 'pH探头校准，偏差0.2以内', 300);

-- Table: disease_records (5 rows)
INSERT INTO `disease_records` (`id`, `fieldId`, `fieldCode`, `diseaseName`, `cropAffected`, `detectedAt`, `severity`, `status`, `imageUrl`, `treatmentPlan`, `resolvedAt`) VALUES
  ('dis_01', 'field_c1', 'C1', '草莓白粉病', '草莓', '2024-01-13 09:15', 'medium', 'processing', 'assets/disease/strawberry_powdery.jpg', '喷洒硫磺悬浮剂，间隔7天重复一次，加强通风', NULL),
  ('dis_02', 'field_a1', 'A1', '番茄晚疫病', '番茄', '2024-01-15 10:30', 'high', 'resolved', 'assets/disease/tomato_late_blight.jpg', '喷洒霜脲·锰锌可湿性粉剂，清除病叶，加强通风降湿', '2024-01-18 16:00'),
  ('dis_03', 'field_a2', 'A2', '无病虫害', '黄瓜', '2024-01-14 14:20', 'low', 'resolved', '', '', NULL),
  ('dis_04', 'field_b2', 'B2', '蚜虫', '茄子', '2024-01-13 09:15', 'medium', 'processing', 'assets/disease/eggplant_aphid.jpg', '喷洒吡虫啉可湿性粉剂，释放瓢虫进行生物防治', NULL),
  ('dis_05', 'field_b1', 'B1', '辣椒霜霉病', '辣椒', '2024-01-10 11:00', 'high', 'resolved', 'assets/disease/pepper_downy.jpg', '喷洒甲霜灵·锰锌，清除病株，轮作倒茬', '2024-01-14 09:30');

-- Table: pest_knowledge_base (6 rows)
INSERT INTO `pest_knowledge_base` (`id`, `name`, `scientificName`, `symptoms`, `causes`, `prevention`, `chemicalControl`, `biologicalControl`, `agriculturalControl`, `affectedCrops`, `severity`, `icon`, `color`) VALUES
  ('pest_01', '番茄晚疫病', 'Phytophthora infestans', '叶片出现暗绿色水渍状斑点，湿度大时叶背出现白色霉层，茎部出现褐色条斑，果实腐烂', '低温高湿（<24°C, >75%RH）环境，病原菌通过风雨传播', '["选用抗病品种", "合理密植，加强通风", "避免偏施氮肥", "及时清除病残体"]', '["霜脲·锰锌可湿性粉剂 800-1000倍液", "烯酰·吡唑酯水分散粒剂 1500倍液", "安全间隔期7-10天"]', '["枯草芽孢杆菌可湿性粉剂", "木霉菌制剂土壤处理"]', '["实行3年以上轮作", "高畦栽培，地膜覆盖", "控制灌溉量，降低田间湿度"]', '["crop_tomato"]', 'high', 'fa-leaf', 'red'),
  ('pest_02', '蚜虫', 'Aphidoidea', '叶片卷曲发黄，生长点萎缩，植株矮小，叶片和嫩茎上有蜜露，诱发煤污病', '温暖干燥气候利于繁殖，5-6月和9-10月为高发期', '["悬挂黄色粘虫板诱杀", "清除田间杂草", "合理施肥，避免氮肥过多"]', '["吡虫啉可湿性粉剂 2000倍液", "啶虫脒乳油 1500倍液", "安全间隔期5-7天"]', '["释放瓢虫（每亩2000-3000头）", "释放草蛉", "蚜霉菌制剂喷洒"]', '["间作驱避植物（大蒜、洋葱）", "银灰色地膜覆盖驱避", "及时摘除虫叶"]', '["crop_eggplant", "crop_cucumber", "crop_pepper"]', 'medium', 'fa-bug', 'orange'),
  ('pest_03', '白粉病', 'Erysiphales', '叶片和茎部出现白色粉状物，严重时叶片枯黄脱落，果实发育不良', '温暖干燥与高湿交替，通风不良，种植过密', '["选用抗病品种", "合理密植，加强通风透光", "控制氮肥，增施磷钾肥"]', '["硫磺悬浮剂 300-500倍液", "苯醚甲环唑水分散粒剂 1500倍液", "安全间隔期7-10天"]', '["小苏打溶液（0.5%）叶面喷施", "枯草芽孢杆菌制剂"]', '["清除病残体并深埋", "合理灌溉，避免叶面长时间湿润", "轮作倒茬"]', '["crop_strawberry", "crop_cucumber"]', 'medium', 'fa-snowflake-o', 'gray'),
  ('pest_04', '霜霉病', 'Peronosporaceae', '叶背出现霜状灰白色霉层，叶片正面出现多角形黄褐色病斑，严重时整叶枯死', '高湿度（>85%RH），温度15-22°C，露水持续时间长', '["加强通风降湿", "合理灌溉，避免大水漫灌", "及时整枝打杈"]', '["甲霜灵·锰锌可湿性粉剂 500倍液", "霜霉威盐酸盐水剂 600倍液", "安全间隔期5-7天"]', '["哈茨木霉菌制剂", "寡雄腐霉菌制剂"]', '["选用抗病砧木嫁接", "高畦覆膜栽培", "雨后及时排水"]', '["crop_cucumber", "crop_pepper"]', 'high', 'fa-tint', 'blue'),
  ('pest_05', '灰霉病', 'Botrytis cinerea', '花器和果实出现灰色霉层，果实软腐，叶片出现水渍状大斑', '低温高湿（<20°C, >90%RH），通风不良，植株伤口多', '["加强通风，降低湿度", "及时摘除病花病果", "减少植株伤口"]', '["嘧霉胺悬浮剂 1000倍液", "腐霉利可湿性粉剂 800倍液", "安全间隔期7天"]', '["木霉菌制剂喷施", "芽孢杆菌制剂"]', '["地膜覆盖降低地面蒸发", "合理密植", "清洁田园"]', '["crop_tomato", "crop_strawberry"]', 'high', 'fa-circle-o', 'purple'),
  ('pest_06', '根结线虫', 'Meloidogyne spp.', '根部形成瘤状结节，植株矮小黄化，中午萎蔫，产量大幅下降', '连作种植，沙质土壤，温度25-30°C利于繁殖', '["选用抗线虫品种", "太阳能土壤消毒", "避免连作"]', '["噻唑膦颗粒剂 2-3kg/亩沟施", "阿维菌素乳油 1000倍液灌根"]', '["淡紫拟青霉菌剂", "施用含有益微生物的有机肥"]', '["水旱轮作", "种植万寿菊等驱避植物", "夏季深翻晒土"]', '["crop_tomato", "crop_cucumber"]', 'critical', 'fa-chain-broken', 'red');

-- Table: products (6 rows)
INSERT INTO `products` (`id`, `name`, `cropId`, `batchNumber`, `fieldId`, `harvestDate`, `quantityTons`, `traceStatus`, `qrCode`, `certifications`) VALUES
  ('prod_01', '有机番茄', 'crop_tomato', 'TP20240115', 'field_a1', '2024-01-15', 45, 'traced', 'QR_TP20240115', '["cert_01", "cert_02"]'),
  ('prod_02', '黄瓜', 'crop_cucumber', 'HG20240118', 'field_a2', '2024-01-18', 32, 'traced', 'QR_HG20240118', '["cert_03"]'),
  ('prod_03', '辣椒', 'crop_pepper', 'LJ20240120', 'field_b1', '2024-01-20', 28, 'pending', '', '[]'),
  ('prod_04', '草莓', 'crop_strawberry', 'CM20240122', 'field_c1', '2024-01-22', 23.5, 'traced', 'QR_CM20240122', '["cert_04", "cert_05"]'),
  ('prod_05', '有机番茄（第二批）', 'crop_tomato', 'TP20240201', 'field_c2', '2024-02-01', 50, 'traced', 'QR_TP20240201', '["cert_06", "cert_07"]'),
  ('prod_06', '茄子', 'crop_eggplant', 'QZ20240125', 'field_b2', '2024-01-25', 18, 'pending', '', '[]');

-- Table: production_timeline (24 rows)
INSERT INTO `production_timeline` (`id`, `productId`, `productName`, `batchNumber`, `stage`, `date`, `location`, `description`, `operator`) VALUES
  ('tl_01', 'prod_01', '有机番茄', 'TP20240115', '播种', '2024-01-05 08:30', 'A1', '番茄种子播种，品种：金鹏一号', 'u002'),
  ('tl_02', 'prod_01', '有机番茄', 'TP20240115', '施肥', '2024-01-10 10:00', 'A1', '施用有机肥50kg，配合生物菌剂', 'u003'),
  ('tl_03', 'prod_01', '有机番茄', 'TP20240115', '灌溉', '2024-01-12 09:00', 'A1', '滴灌浇水，水量25m³', 'u002'),
  ('tl_04', 'prod_01', '有机番茄', 'TP20240115', '采收', '2024-01-15 08:00', 'A1', '人工采收，产量45吨', 'u006'),
  ('tl_05', 'prod_02', '黄瓜', 'HG20240118', '播种', '2023-12-10 09:00', 'A2', '黄瓜种子播种，品种：津春4号', 'u003'),
  ('tl_06', 'prod_02', '黄瓜', 'HG20240118', '施肥', '2023-12-20 10:00', 'A2', '基肥施用，复合肥40kg', 'u002'),
  ('tl_07', 'prod_02', '黄瓜', 'HG20240118', '灌溉', '2024-01-02 08:30', 'A2', '滴灌浇水，水量18m³', 'u002'),
  ('tl_08', 'prod_02', '黄瓜', 'HG20240118', '采收', '2024-01-18 07:00', 'A2', '人工采收，产量32吨', 'u003'),
  ('tl_09', 'prod_03', '辣椒', 'LJ20240120', '播种', '2023-11-20 09:30', 'B1', '辣椒种子播种，品种：湘辣7号', 'u006'),
  ('tl_10', 'prod_03', '辣椒', 'LJ20240120', '施肥', '2023-12-05 10:00', 'B1', '基肥施用，NPK复合肥30kg', 'u006');
INSERT INTO `production_timeline` (`id`, `productId`, `productName`, `batchNumber`, `stage`, `date`, `location`, `description`, `operator`) VALUES
  ('tl_11', 'prod_03', '辣椒', 'LJ20240120', '灌溉', '2023-12-20 08:00', 'B1', '滴灌浇水，水量20m³', 'u003'),
  ('tl_12', 'prod_03', '辣椒', 'LJ20240120', '采收', '2024-01-20 07:00', 'B1', '人工采收，产量28吨', 'u006'),
  ('tl_13', 'prod_04', '草莓', 'CM20240122', '播种', '2023-11-01 08:30', 'C1', '草莓苗定植，品种：章姬', 'u002'),
  ('tl_14', 'prod_04', '草莓', 'CM20240122', '施肥', '2023-11-15 10:00', 'C1', '追施有机肥30kg + 钾肥10kg', 'u002'),
  ('tl_15', 'prod_04', '草莓', 'CM20240122', '灌溉', '2023-12-10 09:00', 'C1', '滴灌浇水，水量15m³', 'u003'),
  ('tl_16', 'prod_04', '草莓', 'CM20240122', '采收', '2024-01-22 07:30', 'C1', '人工采收，产量23.5吨', 'u002'),
  ('tl_17', 'prod_05', '有机番茄（第二批）', 'TP20240201', '播种', '2024-01-01 08:00', 'C2', '番茄种子播种，品种：金鹏一号', 'u003'),
  ('tl_18', 'prod_05', '有机番茄（第二批）', 'TP20240201', '施肥', '2024-01-08 10:00', 'C2', '基肥施用，有机肥60kg', 'u006'),
  ('tl_19', 'prod_05', '有机番茄（第二批）', 'TP20240201', '灌溉', '2024-01-12 08:30', 'C2', '滴灌浇水，水量30m³', 'u002'),
  ('tl_20', 'prod_05', '有机番茄（第二批）', 'TP20240201', '采收', '2024-02-01 07:00', 'C2', '人工采收，产量50吨', 'u003');
INSERT INTO `production_timeline` (`id`, `productId`, `productName`, `batchNumber`, `stage`, `date`, `location`, `description`, `operator`) VALUES
  ('tl_21', 'prod_06', '茄子', 'QZ20240125', '播种', '2023-11-10 09:00', 'B2', '茄子种子播种，品种：紫长茄', 'u006'),
  ('tl_22', 'prod_06', '茄子', 'QZ20240125', '施肥', '2023-11-25 10:00', 'B2', '基肥施用，复合肥35kg', 'u003'),
  ('tl_23', 'prod_06', '茄子', 'QZ20240125', '灌溉', '2023-12-15 08:00', 'B2', '滴灌浇水，水量22m³', 'u006'),
  ('tl_24', 'prod_06', '茄子', 'QZ20240125', '采收', '2024-01-25 07:00', 'B2', '人工采收，产量18吨', 'u003');

-- Table: quality_certifications (18 rows)
INSERT INTO `quality_certifications` (`id`, `productId`, `name`, `result`, `certNumber`, `testedAt`, `notes`) VALUES
  ('cert_01', 'prod_01', '农药残留检测', 'pass', 'NY-2024-0015', '2024-01-16', '符合GB 2763标准，未检出农药残留'),
  ('cert_02', 'prod_01', '有机认证', 'pass', 'ORG-2024-0015', '2024-01-16', '通过中国有机产品认证'),
  ('cert_03', 'prod_01', '质量等级评定', 'pass', 'QL-TP20240115', '2024-01-16', '质量等级：A级，果形整齐，色泽鲜亮'),
  ('cert_04', 'prod_02', '农药残留检测', 'pass', 'NY-2024-0018', '2024-01-19', '符合标准'),
  ('cert_05', 'prod_02', '质量等级评定', 'pass', 'QL-HG20240118', '2024-01-19', '质量等级：A级'),
  ('cert_06', 'prod_03', '农药残留检测', 'pending', '', '', '送检中'),
  ('cert_07', 'prod_04', '农药残留检测', 'pass', 'NY-2024-0022', '2024-01-23', '符合标准'),
  ('cert_08', 'prod_04', '有机认证', 'pass', 'ORG-2024-0022', '2024-01-23', '通过有机认证'),
  ('cert_09', 'prod_04', '质量等级评定', 'pass', 'QL-CM20240122', '2024-01-23', '质量等级：A级'),
  ('cert_10', 'prod_05', '农药残留检测', 'pass', 'NY-2024-0030', '2024-02-02', '符合标准');
INSERT INTO `quality_certifications` (`id`, `productId`, `name`, `result`, `certNumber`, `testedAt`, `notes`) VALUES
  ('cert_11', 'prod_05', '有机认证', 'pass', 'ORG-2024-0030', '2024-02-02', '通过有机认证'),
  ('cert_12', 'prod_06', '农药残留检测', 'pending', '', '', '送检中'),
  ('cert_13', 'prod_01', '重金属检测', 'pass', 'HM-2024-0015', '2024-01-17', '铅、镉、汞均未检出'),
  ('cert_14', 'prod_02', '重金属检测', 'pass', 'HM-2024-0018', '2024-01-19', '符合标准'),
  ('cert_15', 'prod_04', '重金属检测', 'pass', 'HM-2024-0022', '2024-01-24', '符合标准'),
  ('cert_16', 'prod_05', '质量等级评定', 'pass', 'QL-TP20240201', '2024-02-02', '质量等级：A级'),
  ('cert_17', 'prod_05', '重金属检测', 'pass', 'HM-2024-0030', '2024-02-02', '符合标准'),
  ('cert_18', 'prod_06', '质量等级评定', 'pending', '', '', '待检测');

-- Table: yield_predictions (12 rows)
INSERT INTO `yield_predictions` (`id`, `month`, `actual`, `predicted`, `cropId`) VALUES
  ('yp_01', '2024-01', 110, NULL, 'crop_tomato'),
  ('yp_02', '2024-02', 115, NULL, 'crop_tomato'),
  ('yp_03', '2024-03', 120, NULL, 'crop_tomato'),
  ('yp_04', '2024-04', 125, NULL, 'crop_tomato'),
  ('yp_05', '2024-05', 130, NULL, 'crop_tomato'),
  ('yp_06', '2024-06', NULL, 135, 'crop_tomato'),
  ('yp_07', '2024-07', NULL, 140, 'crop_tomato'),
  ('yp_08', '2024-08', NULL, 145, 'crop_tomato'),
  ('yp_09', '2024-09', NULL, 150, 'crop_tomato'),
  ('yp_10', '2024-10', NULL, 148, 'crop_tomato');
INSERT INTO `yield_predictions` (`id`, `month`, `actual`, `predicted`, `cropId`) VALUES
  ('yp_11', '2024-11', NULL, 142, 'crop_tomato'),
  ('yp_12', '2024-12', NULL, 138, 'crop_tomato');

-- Table: environment_readings (24 rows)
INSERT INTO `environment_readings` (`id`, `timestamp`, `temperature`, `humidity`, `deviceId`, `location`) VALUES
  ('env_01', '2024-01-15 06:00', 18, 75, 'dev_04', 'A1'),
  ('env_02', '2024-01-15 07:00', 19, 73, 'dev_04', 'A1'),
  ('env_03', '2024-01-15 08:00', 22, 70, 'dev_04', 'A1'),
  ('env_04', '2024-01-15 09:00', 25, 67, 'dev_04', 'A1'),
  ('env_05', '2024-01-15 10:00', 28, 65, 'dev_04', 'A1'),
  ('env_06', '2024-01-15 11:00', 30, 62, 'dev_04', 'A1'),
  ('env_07', '2024-01-15 12:00', 32, 60, 'dev_04', 'A1'),
  ('env_08', '2024-01-15 13:00', 31, 59, 'dev_04', 'A1'),
  ('env_09', '2024-01-15 14:00', 30, 58, 'dev_04', 'A1'),
  ('env_10', '2024-01-15 15:00', 29, 60, 'dev_04', 'A1');
INSERT INTO `environment_readings` (`id`, `timestamp`, `temperature`, `humidity`, `deviceId`, `location`) VALUES
  ('env_11', '2024-01-15 16:00', 26, 62, 'dev_04', 'A1'),
  ('env_12', '2024-01-15 17:00', 24, 66, 'dev_04', 'A1'),
  ('env_13', '2024-01-15 18:00', 22, 70, 'dev_04', 'A1'),
  ('env_14', '2024-01-15 19:00', 20, 73, 'dev_04', 'A1'),
  ('env_15', '2024-01-15 20:00', 19, 75, 'dev_04', 'A1'),
  ('env_16', '2024-01-15 06:00', 17, 78, 'dev_06', 'C1'),
  ('env_17', '2024-01-15 08:00', 20, 74, 'dev_06', 'C1'),
  ('env_18', '2024-01-15 10:00', 25, 70, 'dev_06', 'C1'),
  ('env_19', '2024-01-15 12:00', 28, 65, 'dev_06', 'C1'),
  ('env_20', '2024-01-15 14:00', 30, 62, 'dev_06', 'C1');
INSERT INTO `environment_readings` (`id`, `timestamp`, `temperature`, `humidity`, `deviceId`, `location`) VALUES
  ('env_21', '2024-01-15 16:00', 27, 66, 'dev_06', 'C1'),
  ('env_22', '2024-01-15 18:00', 23, 70, 'dev_06', 'C1'),
  ('env_23', '2024-01-15 20:00', 20, 74, 'dev_06', 'C1'),
  ('env_24', '2024-01-15 22:00', 18, 77, 'dev_06', 'C1');

-- Table: soil_readings (12 rows)
INSERT INTO `soil_readings` (`id`, `timestamp`, `fieldId`, `moisture`, `ph`, `nLevel`, `pLevel`, `kLevel`) VALUES
  ('soil_01', '2024-01-15 00:00', 'field_a1', 65, 6.5, 85, 72, 78),
  ('soil_02', '2024-01-15 02:00', 'field_a1', 66, 6.5, 85, 72, 78),
  ('soil_03', '2024-01-15 04:00', 'field_a1', 69, 6.6, 84, 71, 77),
  ('soil_04', '2024-01-15 06:00', 'field_a1', 68, 6.5, 85, 72, 78),
  ('soil_05', '2024-01-15 08:00', 'field_a1', 65, 6.5, 84, 71, 77),
  ('soil_06', '2024-01-15 10:00', 'field_a1', 63, 6.6, 84, 70, 76),
  ('soil_07', '2024-01-15 12:00', 'field_a1', 62, 6.5, 83, 70, 76),
  ('soil_08', '2024-01-15 14:00', 'field_a1', 60, 6.5, 83, 69, 75),
  ('soil_09', '2024-01-15 16:00', 'field_a1', 58, 6.5, 82, 69, 75),
  ('soil_10', '2024-01-15 18:00', 'field_a1', 56, 6.4, 82, 68, 74);
INSERT INTO `soil_readings` (`id`, `timestamp`, `fieldId`, `moisture`, `ph`, `nLevel`, `pLevel`, `kLevel`) VALUES
  ('soil_11', '2024-01-15 20:00', 'field_a1', 60, 6.5, 83, 70, 76),
  ('soil_12', '2024-01-15 22:00', 'field_a1', 64, 6.5, 84, 71, 77);

-- Table: alerts (6 rows)
INSERT INTO `alerts` (`id`, `type`, `title`, `message`, `severity`, `fieldId`, `isRead`, `isResolved`, `createdAt`, `actionRequired`) VALUES
  ('alert_01', 'pest', '病虫害预警', '地块C1检测到潜在草莓白粉病风险，建议立即检查并采取防治措施', 'critical', 'field_c1', 0, 0, '2024-01-15 08:00', '立即查看并启动防治方案'),
  ('alert_02', 'drought', '土壤湿度偏低', '地块B1土壤湿度降至45%，低于辣椒生长阈值（60%），需要立即灌溉', 'warning', 'field_b1', 0, 0, '2024-01-15 07:30', '启动B1灌溉方案（22m³，预计45分钟）'),
  ('alert_03', 'maintenance', '设备维护提醒', '灌溉泵#3运行时间已达3200小时，超过维护周期，需尽快安排检修', 'info', NULL, 1, 0, '2024-01-14 10:00', '安排维护计划'),
  ('alert_04', 'temperature', '温度异常预警', '温室温度超过30°C，可能影响草莓生长，需要通风降温', 'warning', 'field_c1', 0, 0, '2024-01-15 12:00', '开启通风系统'),
  ('alert_05', 'market', '市场行情提醒', '番茄价格同比上涨5%，建议适时采收上市', 'info', NULL, 1, 1, '2024-01-14 08:00', ''),
  ('alert_06', 'pest', '蚜虫复发预警', '地块B2茄子蚜虫防治后7天，建议复查防治效果', 'warning', 'field_b2', 0, 0, '2024-01-15 09:00', '安排复查');

-- Table: operation_logs (8 rows)
INSERT INTO `operation_logs` (`id`, `action`, `userId`, `username`, `module`, `timestamp`, `details`) VALUES
  ('log_01', '修改用户信息', 'u001', 'admin', '权限管理', '2024-01-15 14:30', '修改了用户\'李农户\'的联系方式'),
  ('log_02', '添加新用户', 'u001', 'admin', '权限管理', '2024-01-15 10:15', '添加了用户\'赵农户\'（角色：农户）'),
  ('log_03', '重置密码', 'u002', 'zhang_tech', '权限管理', '2024-01-14 16:45', '为用户\'李农户\'重置了登录密码'),
  ('log_04', '禁用用户', 'u001', 'admin', '权限管理', '2024-01-14 09:20', '禁用了用户\'王管理员\'的账号'),
  ('log_05', '执行灌溉方案', 'u002', 'zhang_tech', '精准农事', '2024-01-15 08:35', '启动了A1地块自动灌溉，水量15m³'),
  ('log_06', '添加农事记录', 'u003', 'li_farmer', '农场管理', '2024-01-15 10:30', '新增了A2地块修剪作业记录'),
  ('log_07', '生成溯源码', 'u001', 'admin', '溯源管理', '2024-01-15 11:00', '为批次TP20240115生成溯源二维码'),
  ('log_08', '修改设备配置', 'u002', 'zhang_tech', '设备监控', '2024-01-15 09:45', '调整了智能温室温度阈值设为25°C');

-- Table: inventory (6 rows)
INSERT INTO `inventory` (`id`, `name`, `category`, `unit`, `unitWeight`, `quantity`, `thresholdLow`, `status`, `lastRestocked`, `supplier`) VALUES
  ('inv_01', '氮肥（尿素）', 'fertilizer', '50kg/袋', 50, 20, 10, 'sufficient', '2024-01-05', '农资公司A'),
  ('inv_02', '磷肥（过磷酸钙）', 'fertilizer', '50kg/袋', 50, 8, 10, 'low', '2023-12-20', '农资公司A'),
  ('inv_03', '钾肥（硫酸钾）', 'fertilizer', '25kg/袋', 25, 15, 8, 'sufficient', '2024-01-02', '农资公司B'),
  ('inv_04', '有机肥', 'fertilizer', '40kg/袋', 40, 30, 15, 'sufficient', '2024-01-10', '有机肥厂C'),
  ('inv_05', '吡虫啉可湿性粉剂', 'pesticide', '500g/袋', 0.5, 25, 10, 'sufficient', '2024-01-03', '农药公司D'),
  ('inv_06', '番茄种子（金鹏一号）', 'seed', '1000粒/袋', 0.1, 5, 3, 'sufficient', '2023-12-01', '种子公司E');

-- Table: personnel (5 rows)
INSERT INTO `personnel` (`id`, `name`, `role`, `status`, `avatar`, `phone`, `email`, `joinedAt`, `assignedFields`) VALUES
  ('pers_01', '张技术员', '技术主管', 'on_duty', 'Zhang', '13800001002', 'zhang@smartfarm.cn', '2023-08-15', '["field_a1", "field_a2", "field_c1"]'),
  ('pers_02', '李农户', '种植员', 'on_duty', 'Li', '13800001003', 'li@smartfarm.cn', '2023-09-01', '["field_a2", "field_b1"]'),
  ('pers_03', '赵农户', '种植员', 'on_duty', 'Zhao', '13800001006', 'zhao@smartfarm.cn', '2023-11-01', '["field_b1", "field_b2"]'),
  ('pers_04', '陈技术员', '设备维护工程师', 'on_duty', 'Chen', '13800001005', 'chen@smartfarm.cn', '2023-10-10', '[]'),
  ('pers_05', '王师傅', '农机操作员', 'leave', 'Wang', '13800001004', 'wang@smartfarm.cn', '2023-07-20', '["field_c2"]');

-- Table: planting_cycles (6 rows)
INSERT INTO `planting_cycles` (`id`, `fieldId`, `farmId`, `cropId`, `cropName`, `plantedDate`, `expectedHarvestDate`, `actualHarvestDate`, `yieldTons`, `qualityGrade`, `growthStage`, `notes`) VALUES
  ('pc_001', 'field_a1', 'farm_01', 'crop_tomato', '番茄', '2023-11-01', '2024-01-30', NULL, NULL, NULL, '结果期', '品种：瑞丰一号，采用滴灌技术'),
  ('pc_002', 'field_a2', 'farm_01', 'crop_cucumber', '黄瓜', '2023-11-10', '2024-01-25', NULL, NULL, NULL, '采收期', '品种：津研四号，大棚种植'),
  ('pc_003', 'field_b1', 'farm_01', 'crop_pepper', '辣椒', '2023-10-15', '2024-02-05', NULL, NULL, NULL, '开花期', '品种：湘研15号，露地种植'),
  ('pc_004', 'field_b2', 'farm_01', 'crop_eggplant', '茄子', '2023-10-20', '2024-02-10', NULL, NULL, NULL, '结果期', '品种：紫长茄，大棚种植'),
  ('pc_005', 'field_c1', 'farm_01', 'crop_strawberry', '草莓', '2023-11-15', '2024-02-15', NULL, NULL, NULL, '幼果期', '品种：红颜，高架基质栽培'),
  ('pc_006', 'field_c2', 'farm_02', 'crop_tomato', '番茄', '2024-02-01', '2024-04-30', NULL, NULL, NULL, '休耕准备', '轮作休耕，计划下季种植');

-- Table: weather_records (14 rows)
INSERT INTO `weather_records` (`id`, `date`, `temperatureHigh`, `temperatureLow`, `humidity`, `rainfall_mm`, `windSpeed`, `condition`, `forecast`) VALUES
  ('wtr_001', '2024-01-09', 22, 8, 72, 0, 3.2, 'sunny', '未来三天持续晴好，适宜农事作业'),
  ('wtr_002', '2024-01-10', 24, 9, 68, 0, 2.8, 'sunny', '气温回升，注意大棚通风'),
  ('wtr_003', '2024-01-11', 26, 10, 65, 0, 3.5, 'sunny', '午后风力增大，加固设施'),
  ('wtr_004', '2024-01-12', 20, 12, 78, 5.2, 4.1, 'rain', '小雨转阴，暂停户外作业'),
  ('wtr_005', '2024-01-13', 18, 10, 82, 12.8, 3.0, 'rain', '持续降雨，注意排涝防病'),
  ('wtr_006', '2024-01-14', 19, 8, 70, 0, 2.5, 'cloudy', '天气转好，可恢复田间作业'),
  ('wtr_007', '2024-01-15', 23, 11, 66, 0, 2.2, 'sunny', '天气晴好，适宜灌溉和施肥作业'),
  ('wtr_008', '2024-01-16', 25, 12, 62, 0, 2.0, 'sunny', '晴暖天气持续'),
  ('wtr_009', '2024-01-17', 27, 13, 58, 0, 3.8, 'sunny', '气温偏高，注意防旱浇水'),
  ('wtr_010', '2024-01-18', 16, 6, 60, 0, 5.2, 'cloudy', '冷空气来袭，预计降温6-8°C，做好防寒准备');
INSERT INTO `weather_records` (`id`, `date`, `temperatureHigh`, `temperatureLow`, `humidity`, `rainfall_mm`, `windSpeed`, `condition`, `forecast`) VALUES
  ('wtr_011', '2024-01-19', 12, 3, 55, 2.1, 4.5, 'rain', '低温阴雨，设施大棚注意保温'),
  ('wtr_012', '2024-01-20', 14, 4, 58, 0, 3.0, 'cloudy', '气温缓慢回升'),
  ('wtr_013', '2024-01-21', 18, 6, 64, 0, 2.5, 'sunny', '天气转好'),
  ('wtr_014', '2024-01-22', 21, 8, 68, 0, 2.8, 'sunny', '恢复正常农事作业');

-- Table: market_prices (36 rows)
INSERT INTO `market_prices` (`id`, `cropName`, `pricePerKg`, `unit`, `market`, `date`, `changePercent`, `trend`) VALUES
  ('mp_001', '番茄', 4.8, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-09', 2.1, 'up'),
  ('mp_002', '番茄', 4.95, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-10', 3.1, 'up'),
  ('mp_003', '番茄', 5.1, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-11', 3.0, 'up'),
  ('mp_004', '番茄', 5.2, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-12', 1.9, 'up'),
  ('mp_005', '番茄', 5.35, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-13', 2.8, 'up'),
  ('mp_006', '番茄', 5.45, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-14', 1.8, 'up'),
  ('mp_007', '番茄', 5.58, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-15', 2.3, 'up'),
  ('mp_008', '黄瓜', 3.6, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-09', -1.1, 'down'),
  ('mp_009', '黄瓜', 3.45, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-10', -4.1, 'down'),
  ('mp_010', '黄瓜', 3.5, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-11', 1.4, 'up');
INSERT INTO `market_prices` (`id`, `cropName`, `pricePerKg`, `unit`, `market`, `date`, `changePercent`, `trend`) VALUES
  ('mp_011', '黄瓜', 3.55, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-12', 1.4, 'up'),
  ('mp_012', '黄瓜', 3.52, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-13', -0.8, 'stable'),
  ('mp_013', '黄瓜', 3.48, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-14', -1.1, 'down'),
  ('mp_014', '黄瓜', 3.42, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-15', -1.7, 'down'),
  ('mp_015', '辣椒', 6.2, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-09', 0.5, 'stable'),
  ('mp_016', '辣椒', 6.35, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-10', 2.4, 'up'),
  ('mp_017', '辣椒', 6.5, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-11', 2.3, 'up'),
  ('mp_018', '辣椒', 6.45, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-12', -0.7, 'stable'),
  ('mp_019', '辣椒', 6.6, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-13', 2.3, 'up'),
  ('mp_020', '辣椒', 6.75, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-14', 2.2, 'up');
INSERT INTO `market_prices` (`id`, `cropName`, `pricePerKg`, `unit`, `market`, `date`, `changePercent`, `trend`) VALUES
  ('mp_021', '辣椒', 6.9, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-15', 2.2, 'up'),
  ('mp_022', '草莓', 18.5, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-09', 5.7, 'up'),
  ('mp_023', '草莓', 19.2, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-10', 3.7, 'up'),
  ('mp_024', '草莓', 18.8, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-11', -2.0, 'down'),
  ('mp_025', '草莓', 19.5, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-12', 3.7, 'up'),
  ('mp_026', '草莓', 20.0, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-13', 2.5, 'up'),
  ('mp_027', '草莓', 20.5, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-14', 2.5, 'up'),
  ('mp_028', '草莓', 21.0, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-15', 2.4, 'up'),
  ('mp_029', '茄子', 5.1, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-12', 1.0, 'up'),
  ('mp_030', '茄子', 5.05, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-13', -0.9, 'stable');
INSERT INTO `market_prices` (`id`, `cropName`, `pricePerKg`, `unit`, `market`, `date`, `changePercent`, `trend`) VALUES
  ('mp_031', '茄子', 5.08, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-14', 0.5, 'stable'),
  ('mp_032', '茄子', 5.15, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-15', 1.3, 'up'),
  ('mp_033', '玉米', 2.8, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-12', 0, 'stable'),
  ('mp_034', '玉米', 2.82, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-13', 0.7, 'stable'),
  ('mp_035', '玉米', 2.78, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-14', -1.4, 'down'),
  ('mp_036', '玉米', 2.85, '元/公斤', '昆明呈贡龙城批发市场', '2024-01-15', 2.5, 'up');

-- Table: knowledge_documents (8 rows)
INSERT INTO `knowledge_documents` (`id`, `title`, `category`, `cropTarget`, `originalText`, `sourceRegulation`, `keywords`, `publishDate`) VALUES
  ('kd_001', '番茄晚疫病防治技术规范', 'disease', '番茄', '番茄晚疫病由致病疫霉菌引起。发病初期叶片出现暗绿色水渍状病斑，湿度大时叶背出现白色霉层。防治方法：1）选用抗病品种；2）合理轮作，避免连作；3）发病初期喷洒58%甲霜灵·锰锌可湿性粉剂500倍液或72%霜脲·锰锌可湿性粉剂800倍液，间隔7-10天喷1次，连续2-3次；4）及时清除病株残体，集中深埋处理。', 'NY/T 1857-2010 《番茄晚疫病综合防治技术规程》', '["晚疫病", "番茄", "杀菌剂", "甲霜灵", "农业防治"]', '2020-06-15'),
  ('kd_002', '蚜虫综合防治技术规范', 'pest', '多作物', '蚜虫以成蚜和若蚜群集于叶片背面、嫩茎和花蕾上，刺吸汁液，导致叶片卷曲、发黄，严重时植株矮化。防治方法：1）保护和利用天敌（瓢虫、草蛉、食蚜蝇等）；2）黄板诱杀有翅蚜；3）药剂防治可选用10%吡虫啉可湿性粉剂1500倍液或2.5%高效氯氟氰菊酯乳油2000倍液喷雾；4）安全间隔期：吡虫啉7天，高效氯氟氰菊酯14天。', 'GB/T 8321.8-2005 《农药合理使用准则（八）》', '["蚜虫", "生物防治", "黄板", "吡虫啉", "天敌"]', '2019-03-20'),
  ('kd_003', '白粉病识别与防治规范', 'disease', '多作物', '白粉病在叶片、叶柄和茎上产生白色粉状霉斑，后期霉斑变灰褐色，上生黑色小粒点。高温干旱与高湿交替利于发病。防治措施：1）选用抗病品种；2）合理密植，注意通风透光；3）发病初期喷洒25%三唑酮可湿性粉剂1000倍液或40%氟硅唑乳油8000倍液；4）大棚种植注意控湿，及时通风降湿。', 'NY/T 1863-2010 《蔬菜白粉病防治技术规程》', '["白粉病", "三唑酮", "控湿", "通风", "氟硅唑"]', '2021-01-10'),
  ('kd_004', '霜霉病绿色防控技术', 'disease', '黄瓜', '黄瓜霜霉病由古巴假霜霉菌引起，主要为害叶片。苗期、成株期均可发生。发病初期叶面出现水渍状斑点，后扩大为多角形病斑，早晨有水滴时病斑呈水渍状。防治：1）选用抗病品种；2）加强栽培管理，合理灌水，注意通风排湿；3）发病初期用72.2%霜霉威水剂600倍液或69%烯酰·锰锌可湿性粉剂600倍液喷雾；4）保护和利用天敌。', 'NY/T 2159-2012 《黄瓜霜霉病综合防治技术规程》', '["霜霉病", "黄瓜", "霜霉威", "生物防治", "绿色防控"]', '2019-08-25'),
  ('kd_005', '设施蔬菜水肥一体化技术规范', 'irrigation', '多作物', '水肥一体化技术是将灌溉与施肥融为一体的农业新技术。借助压力灌溉系统，将肥料溶液均匀、准确地输送到作物根部土壤。技术要求：1）根据作物种类和生育期制定灌溉施肥方案；2）滴灌管铺设深度15-20cm，滴头间距30cm；3）施肥浓度控制：苗期EC值1.0-1.5mS/cm，结果期EC值1.5-2.5mS/cm；4）灌溉量以湿润根层土壤为度，单次灌溉量10-25m³/亩。', 'NY/T 2624-2014 《设施蔬菜水肥一体化技术规范》', '["水肥一体化", "滴灌", "EC值", "精准施肥", "节水"]', '2022-02-28'),
  ('kd_006', '有机蔬菜生产农药使用规范', 'pest', '多作物', '有机蔬菜生产中禁止使用化学合成的农药、化肥和生长调节剂。害虫防治应以农业防治为基础，优先使用生物防治和物理防治：1）灯光诱杀和性诱剂诱杀成虫；2）释放赤眼蜂防治鳞翅目害虫；3）使用Bt制剂（苏云金芽孢杆菌）防治菜青虫和小菜蛾；4）使用植物源农药如苦参碱、印楝素；5）中草药制剂如大蒜素、辣椒素可预防部分病害。', 'GB/T 19630-2019 《有机产品 生产、加工、标识与管理体系要求》', '["有机蔬菜", "生物农药", "Bt制剂", "植物源农药", "有机认证"]', '2020-10-01'),
  ('kd_007', '云南高原特色蔬菜标准化生产技术', 'fertilizer', '多作物', '云南高原蔬菜生产应根据海拔高度和气候特点，制定差异化的栽培管理方案。核心技术要点：1）选择适宜高原生态的优良品种；2）推广地膜覆盖栽培，提高地温保墒；3）增施有机肥，每亩施腐熟农家肥2000-3000kg；4）合理追肥：氮磷钾配比15:15:15复合肥，生长期追施2-3次，每次15-20kg/亩；5）注意预防低温冷害和早晚霜。', 'DB53/T 876-2018 《高原特色蔬菜标准化生产技术规程》', '["高原蔬菜", "地膜覆盖", "有机肥", "标准化生产", "云南"]', '2021-05-15'),
  ('kd_008', '农产品质量安全追溯管理规范', 'other', '多作物', '农产品生产主体应当建立生产记录制度，如实记载下列事项：1）使用农业投入品的名称、来源、用法、用量和使用、停用的日期；2）动物疫病、植物病虫草害的发生和防治情况；3）收获、屠宰或者捕捞的日期。农产品生产记录应当保存二年。禁止伪造农产品生产记录。', '《中华人民共和国农产品质量安全法》第二十四条', '["质量安全", "追溯", "生产记录", "法规", "农产品"]', '2022-09-01');

-- Table: model_versions (6 rows)
INSERT INTO `model_versions` (`id`, `modelName`, `version`, `deployedAt`, `accuracy`, `driftScore`, `status`, `totalPredictions`, `unknownRate`, `description`) VALUES
  ('mv_001', '病虫害图像识别模型', 'v3.2.1', '2024-01-10 09:00:00', 94.5, 0.12, 'active', 2847, 3.2, '基于ResNet-50骨干网络，训练数据含云南地区52种常见病虫害，Top-1准确率94.5%'),
  ('mv_002', '病虫害图像识别模型', 'v3.1.0', '2023-12-01 10:00:00', 92.8, 0.25, 'inactive', 15230, 4.8, 'v3.1版本，新增12种病害识别能力，优化小目标检测'),
  ('mv_003', '产量预测模型', 'v2.0.0', '2024-01-05 14:00:00', 89.2, 0.08, 'active', 856, 0.5, '基于LSTM时间序列预测，融合气象、土壤、生长阶段多模态数据，MAPE误差10.8%'),
  ('mv_004', '产量预测模型', 'v1.8.0', '2023-11-15 08:00:00', 86.5, 0.31, 'deprecated', 4100, 1.2, 'v1.8版本，纯时序模型，未引入气象特征'),
  ('mv_005', '灌溉决策推荐模型', 'v1.5.0', '2023-12-20 11:00:00', 91.8, 0.05, 'active', 3200, 0.8, '基于土壤湿度、气象预报和作物需水模型的多因素灌溉决策'),
  ('mv_006', '病虫害知识库RAG模型', 'v2.1.0', '2024-01-12 16:00:00', NULL, NULL, 'active', 1200, NULL, '基于Milvus向量数据库 + bge-large-zh-v1.5 Embedding，检索农技规范知识库');
