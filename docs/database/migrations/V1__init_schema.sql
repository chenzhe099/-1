-- V1: 初始化数据库表结构
-- 智慧农业管理系统 - Smart Farm Management System
-- 字符集: utf8mb4 (支持中文)

CREATE DATABASE IF NOT EXISTS smartfarm
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE smartfarm;

-- ============================================================
-- Table: roles
-- ============================================================
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100),
  `nameEn` VARCHAR(100),
  `description` TEXT,
  `permissions` JSON,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: users
-- ============================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `username` VARCHAR(100) UNIQUE,
  `displayName` VARCHAR(100),
  `role` VARCHAR(100),
  `avatar` VARCHAR(100),
  `status` VARCHAR(100),
  `phone` VARCHAR(100),
  `email` VARCHAR(100),
  `createdAt` VARCHAR(30),
  `lastLogin` VARCHAR(100),
  `password` VARCHAR(255) DEFAULT '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `users` ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role`) REFERENCES `roles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: farms
-- ============================================================
DROP TABLE IF EXISTS `farms`;
CREATE TABLE `farms` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100),
  `address` TEXT,
  `managerId` VARCHAR(100),
  `area` DECIMAL(10,2),
  `establishedDate` VARCHAR(30),
  `description` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: crops
-- ============================================================
DROP TABLE IF EXISTS `crops`;
CREATE TABLE `crops` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100),
  `nameEn` VARCHAR(100),
  `category` VARCHAR(100),
  `growthDays` INT,
  `optimalTempMin` INT,
  `optimalTempMax` INT,
  `optimalHumidity` INT,
  `icon` VARCHAR(100),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: fields
-- ============================================================
DROP TABLE IF EXISTS `fields`;
CREATE TABLE `fields` (
  `id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(100),
  `name` VARCHAR(100),
  `cropId` VARCHAR(100),
  `cropName` VARCHAR(100),
  `area` DECIMAL(10,2),
  `status` VARCHAR(100),
  `soilMoisture` INT,
  `soilPh` DECIMAL(10,2),
  `plantedDate` VARCHAR(30),
  `expectedHarvest` VARCHAR(100),
  `location` JSON,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `fields` ADD CONSTRAINT `fk_fields_cropId` FOREIGN KEY (`cropId`) REFERENCES `crops`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: farming_tasks
-- ============================================================
DROP TABLE IF EXISTS `farming_tasks`;
CREATE TABLE `farming_tasks` (
  `id` VARCHAR(36) NOT NULL,
  `type` VARCHAR(100),
  `fieldId` VARCHAR(100),
  `fieldCode` VARCHAR(100),
  `cropName` VARCHAR(100),
  `scheduledTime` VARCHAR(100),
  `estimatedDuration` DOUBLE,
  `status` VARCHAR(100),
  `assignedTo` VARCHAR(100),
  `priority` VARCHAR(100),
  `notes` TEXT,
  `completedAt` VARCHAR(30),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `farming_tasks` ADD CONSTRAINT `fk_farming_tasks_fieldId` FOREIGN KEY (`fieldId`) REFERENCES `fields`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `farming_tasks` ADD CONSTRAINT `fk_farming_tasks_assignedTo` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: irrigation_plans
-- ============================================================
DROP TABLE IF EXISTS `irrigation_plans`;
CREATE TABLE `irrigation_plans` (
  `id` VARCHAR(36) NOT NULL,
  `fieldId` VARCHAR(100),
  `fieldCode` VARCHAR(100),
  `cropName` VARCHAR(100),
  `targetMoisture` INT,
  `currentMoisture` INT,
  `waterVolume` INT,
  `estimatedDuration` INT,
  `status` VARCHAR(100),
  `scheduledAt` VARCHAR(30),
  `executedAt` VARCHAR(30),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `irrigation_plans` ADD CONSTRAINT `fk_irrigation_plans_fieldId` FOREIGN KEY (`fieldId`) REFERENCES `fields`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: fertilization_plans
-- ============================================================
DROP TABLE IF EXISTS `fertilization_plans`;
CREATE TABLE `fertilization_plans` (
  `id` VARCHAR(36) NOT NULL,
  `fieldId` VARCHAR(100),
  `fieldCode` VARCHAR(100),
  `cropName` VARCHAR(100),
  `nKg` INT,
  `pKg` INT,
  `kKg` INT,
  `organicKg` INT,
  `status` VARCHAR(100),
  `scheduledAt` VARCHAR(30),
  `executedAt` VARCHAR(30),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `fertilization_plans` ADD CONSTRAINT `fk_fertilization_plans_fieldId` FOREIGN KEY (`fieldId`) REFERENCES `fields`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: devices
-- ============================================================
DROP TABLE IF EXISTS `devices`;
CREATE TABLE `devices` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100),
  `type` VARCHAR(100),
  `location` VARCHAR(100),
  `status` VARCHAR(100),
  `metrics` JSON,
  `runHours` INT,
  `lastMaintenance` VARCHAR(100),
  `nextMaintenance` VARCHAR(100),
  `ipAddress` VARCHAR(100),
  `firmwareVersion` VARCHAR(100),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: maintenance_records
-- ============================================================
DROP TABLE IF EXISTS `maintenance_records`;
CREATE TABLE `maintenance_records` (
  `id` VARCHAR(36) NOT NULL,
  `deviceId` VARCHAR(100),
  `deviceName` VARCHAR(100),
  `type` VARCHAR(100),
  `status` VARCHAR(100),
  `scheduledDate` VARCHAR(30),
  `completedDate` VARCHAR(30),
  `technicianNote` VARCHAR(100),
  `cost` INT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `maintenance_records` ADD CONSTRAINT `fk_maintenance_records_deviceId` FOREIGN KEY (`deviceId`) REFERENCES `devices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: disease_records
-- ============================================================
DROP TABLE IF EXISTS `disease_records`;
CREATE TABLE `disease_records` (
  `id` VARCHAR(36) NOT NULL,
  `fieldId` VARCHAR(100),
  `fieldCode` VARCHAR(100),
  `diseaseName` VARCHAR(100),
  `cropAffected` VARCHAR(100),
  `detectedAt` VARCHAR(30),
  `severity` VARCHAR(100),
  `status` VARCHAR(100),
  `imageUrl` VARCHAR(500),
  `treatmentPlan` JSON,
  `resolvedAt` VARCHAR(30),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `disease_records` ADD CONSTRAINT `fk_disease_records_fieldId` FOREIGN KEY (`fieldId`) REFERENCES `fields`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: pest_knowledge_base
-- ============================================================
DROP TABLE IF EXISTS `pest_knowledge_base`;
CREATE TABLE `pest_knowledge_base` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100),
  `scientificName` VARCHAR(100),
  `symptoms` TEXT,
  `causes` TEXT,
  `prevention` JSON,
  `chemicalControl` JSON,
  `biologicalControl` JSON,
  `agriculturalControl` JSON,
  `affectedCrops` JSON,
  `severity` VARCHAR(100),
  `icon` VARCHAR(100),
  `color` VARCHAR(100),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: products
-- ============================================================
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100),
  `cropId` VARCHAR(100),
  `batchNumber` VARCHAR(100),
  `fieldId` VARCHAR(100),
  `harvestDate` VARCHAR(30),
  `quantityTons` INT,
  `traceStatus` VARCHAR(100),
  `qrCode` VARCHAR(500),
  `certifications` JSON,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `products` ADD CONSTRAINT `fk_products_cropId` FOREIGN KEY (`cropId`) REFERENCES `crops`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `products` ADD CONSTRAINT `fk_products_fieldId` FOREIGN KEY (`fieldId`) REFERENCES `fields`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: production_timeline
-- ============================================================
DROP TABLE IF EXISTS `production_timeline`;
CREATE TABLE `production_timeline` (
  `id` VARCHAR(36) NOT NULL,
  `productId` VARCHAR(100),
  `productName` VARCHAR(100),
  `batchNumber` VARCHAR(100),
  `stage` VARCHAR(100),
  `date` VARCHAR(100),
  `location` VARCHAR(100),
  `description` TEXT,
  `operator` VARCHAR(100),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `production_timeline` ADD CONSTRAINT `fk_production_timeline_productId` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: quality_certifications
-- ============================================================
DROP TABLE IF EXISTS `quality_certifications`;
CREATE TABLE `quality_certifications` (
  `id` VARCHAR(36) NOT NULL,
  `productId` VARCHAR(100),
  `name` VARCHAR(100),
  `result` VARCHAR(100),
  `certNumber` VARCHAR(100),
  `testedAt` VARCHAR(30),
  `notes` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `quality_certifications` ADD CONSTRAINT `fk_quality_certifications_productId` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: yield_predictions
-- ============================================================
DROP TABLE IF EXISTS `yield_predictions`;
CREATE TABLE `yield_predictions` (
  `id` VARCHAR(36) NOT NULL,
  `month` VARCHAR(100),
  `actual` INT,
  `predicted` VARCHAR(100),
  `cropId` VARCHAR(100),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `yield_predictions` ADD CONSTRAINT `fk_yield_predictions_cropId` FOREIGN KEY (`cropId`) REFERENCES `crops`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: environment_readings
-- ============================================================
DROP TABLE IF EXISTS `environment_readings`;
CREATE TABLE `environment_readings` (
  `id` VARCHAR(36) NOT NULL,
  `timestamp` VARCHAR(30),
  `temperature` INT,
  `humidity` INT,
  `deviceId` VARCHAR(100),
  `location` VARCHAR(100),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `environment_readings` ADD CONSTRAINT `fk_environment_readings_deviceId` FOREIGN KEY (`deviceId`) REFERENCES `devices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: soil_readings
-- ============================================================
DROP TABLE IF EXISTS `soil_readings`;
CREATE TABLE `soil_readings` (
  `id` VARCHAR(36) NOT NULL,
  `timestamp` VARCHAR(30),
  `fieldId` VARCHAR(100),
  `moisture` INT,
  `ph` DOUBLE,
  `nLevel` INT,
  `pLevel` INT,
  `kLevel` INT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `soil_readings` ADD CONSTRAINT `fk_soil_readings_fieldId` FOREIGN KEY (`fieldId`) REFERENCES `fields`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: alerts
-- ============================================================
DROP TABLE IF EXISTS `alerts`;
CREATE TABLE `alerts` (
  `id` VARCHAR(36) NOT NULL,
  `type` VARCHAR(100),
  `title` VARCHAR(100),
  `message` TEXT,
  `severity` VARCHAR(100),
  `fieldId` VARCHAR(100),
  `isRead` TINYINT(1) DEFAULT 0,
  `isResolved` TINYINT(1) DEFAULT 0,
  `createdAt` VARCHAR(30),
  `actionRequired` VARCHAR(100),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `alerts` ADD CONSTRAINT `fk_alerts_fieldId` FOREIGN KEY (`fieldId`) REFERENCES `fields`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: operation_logs
-- ============================================================
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs` (
  `id` VARCHAR(36) NOT NULL,
  `action` VARCHAR(100),
  `userId` VARCHAR(100),
  `username` VARCHAR(100),
  `module` VARCHAR(100),
  `timestamp` VARCHAR(30),
  `details` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `operation_logs` ADD CONSTRAINT `fk_operation_logs_userId` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: inventory
-- ============================================================
DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100),
  `category` VARCHAR(100),
  `unit` VARCHAR(100),
  `unitWeight` INT,
  `quantity` INT,
  `thresholdLow` INT,
  `status` VARCHAR(100),
  `lastRestocked` VARCHAR(100),
  `supplier` VARCHAR(100),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: personnel
-- ============================================================
DROP TABLE IF EXISTS `personnel`;
CREATE TABLE `personnel` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100),
  `role` VARCHAR(100),
  `status` VARCHAR(100),
  `avatar` VARCHAR(100),
  `phone` VARCHAR(100),
  `email` VARCHAR(100),
  `joinedAt` VARCHAR(30),
  `assignedFields` JSON,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: planting_cycles
-- ============================================================
DROP TABLE IF EXISTS `planting_cycles`;
CREATE TABLE `planting_cycles` (
  `id` VARCHAR(36) NOT NULL,
  `fieldId` VARCHAR(100),
  `farmId` VARCHAR(100),
  `cropId` VARCHAR(100),
  `cropName` VARCHAR(100),
  `plantedDate` VARCHAR(30),
  `expectedHarvestDate` VARCHAR(30),
  `actualHarvestDate` VARCHAR(30),
  `yieldTons` VARCHAR(100),
  `qualityGrade` VARCHAR(100),
  `growthStage` VARCHAR(100),
  `notes` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `planting_cycles` ADD CONSTRAINT `fk_planting_cycles_fieldId` FOREIGN KEY (`fieldId`) REFERENCES `fields`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `planting_cycles` ADD CONSTRAINT `fk_planting_cycles_farmId` FOREIGN KEY (`farmId`) REFERENCES `farms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `planting_cycles` ADD CONSTRAINT `fk_planting_cycles_cropId` FOREIGN KEY (`cropId`) REFERENCES `crops`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Table: weather_records
-- ============================================================
DROP TABLE IF EXISTS `weather_records`;
CREATE TABLE `weather_records` (
  `id` VARCHAR(36) NOT NULL,
  `date` VARCHAR(100),
  `temperatureHigh` INT,
  `temperatureLow` INT,
  `humidity` INT,
  `rainfall_mm` INT,
  `windSpeed` DECIMAL(10,2),
  `condition` VARCHAR(100),
  `forecast` VARCHAR(100),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: market_prices
-- ============================================================
DROP TABLE IF EXISTS `market_prices`;
CREATE TABLE `market_prices` (
  `id` VARCHAR(36) NOT NULL,
  `cropName` VARCHAR(100),
  `pricePerKg` DECIMAL(10,2),
  `unit` VARCHAR(100),
  `market` VARCHAR(100),
  `date` VARCHAR(100),
  `changePercent` DECIMAL(10,2),
  `trend` VARCHAR(100),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: knowledge_documents
-- ============================================================
DROP TABLE IF EXISTS `knowledge_documents`;
CREATE TABLE `knowledge_documents` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(100),
  `category` VARCHAR(100),
  `cropTarget` VARCHAR(100),
  `originalText` TEXT,
  `sourceRegulation` VARCHAR(100),
  `keywords` JSON,
  `publishDate` VARCHAR(30),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: model_versions
-- ============================================================
DROP TABLE IF EXISTS `model_versions`;
CREATE TABLE `model_versions` (
  `id` VARCHAR(36) NOT NULL,
  `modelName` VARCHAR(100),
  `version` VARCHAR(100),
  `deployedAt` VARCHAR(30),
  `accuracy` DECIMAL(10,2),
  `driftScore` DECIMAL(10,2),
  `status` VARCHAR(100),
  `totalPredictions` INT,
  `unknownRate` DECIMAL(10,2),
  `description` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
