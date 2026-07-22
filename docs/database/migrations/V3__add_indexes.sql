-- V3: 添加索引以优化查询性能

USE smartfarm;

CREATE UNIQUE INDEX `idx_users_username` ON `users` (`username`);
CREATE INDEX `idx_users_role` ON `users` (`role`);
CREATE INDEX `idx_fields_crop` ON `fields` (`cropId`);
CREATE INDEX `idx_ft_status` ON `farming_tasks` (`status`);
CREATE INDEX `idx_ft_scheduled` ON `farming_tasks` (`scheduledTime`);
CREATE INDEX `idx_ft_field` ON `farming_tasks` (`fieldId`);
CREATE INDEX `idx_ip_field` ON `irrigation_plans` (`fieldId`);
CREATE INDEX `idx_fp_field` ON `fertilization_plans` (`fieldId`);
CREATE INDEX `idx_dr_field` ON `disease_records` (`fieldId`);
CREATE INDEX `idx_alerts_unresolved` ON `alerts` (`isResolved`);
CREATE INDEX `idx_alerts_created` ON `alerts` (`createdAt`);
CREATE INDEX `idx_er_device` ON `environment_readings` (`deviceId`);
CREATE INDEX `idx_er_ts` ON `environment_readings` (`timestamp`);
CREATE INDEX `idx_sr_field` ON `soil_readings` (`fieldId`);
CREATE INDEX `idx_sr_ts` ON `soil_readings` (`timestamp`);
CREATE INDEX `idx_products_field` ON `products` (`fieldId`);
CREATE INDEX `idx_pt_product` ON `production_timeline` (`productId`);
CREATE INDEX `idx_qc_product` ON `quality_certifications` (`productId`);
CREATE INDEX `idx_ol_user` ON `operation_logs` (`userId`);
CREATE INDEX `idx_ol_ts` ON `operation_logs` (`timestamp`);
CREATE INDEX `idx_mp_crop` ON `market_prices` (`cropName`);
CREATE INDEX `idx_mp_date` ON `market_prices` (`date`);
CREATE INDEX `idx_wr_date` ON `weather_records` (`date`);
CREATE INDEX `idx_pc_farm` ON `planting_cycles` (`farmId`);
CREATE INDEX `idx_pc_field` ON `planting_cycles` (`fieldId`);
CREATE INDEX `idx_kd_category` ON `knowledge_documents` (`category`);
CREATE INDEX `idx_mv_status` ON `model_versions` (`status`);
CREATE INDEX `idx_yp_crop` ON `yield_predictions` (`cropId`);
