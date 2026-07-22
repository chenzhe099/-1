package com.smartfarm.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

/**
 * 数据迁移服务 — 首次启动时从 JSON 文件导入模拟数据到 MySQL
 * 每张表独立事务，单表失败不影响其他表和应用启动
 */
@Slf4j
@Component
@Order(10)
@RequiredArgsConstructor
public class DataMigrationService implements CommandLineRunner {

    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager em;

    @Lazy
    @Autowired
    private DataMigrationService self;

    @Value("${smartfarm.seed-data-path:../frontend/data}")
    private String seedDataPath;

    private final ObjectMapper mapper = new ObjectMapper();

    private static final Map<String, String> TABLE_ENTITY_MAP = Map.ofEntries(
        Map.entry("users", "Users"),
        Map.entry("roles", "Roles"),
        Map.entry("crops", "Crops"),
        Map.entry("fields", "Fields"),
        Map.entry("farming_tasks", "FarmingTasks"),
        Map.entry("devices", "Devices"),
        Map.entry("irrigation_plans", "IrrigationPlans"),
        Map.entry("fertilization_plans", "FertilizationPlans"),
        Map.entry("maintenance_records", "MaintenanceRecords"),
        Map.entry("disease_records", "DiseaseRecords"),
        Map.entry("pest_knowledge_base", "PestKnowledgeBase"),
        Map.entry("products", "Products"),
        Map.entry("production_timeline", "ProductionTimeline"),
        Map.entry("quality_certifications", "QualityCertifications"),
        Map.entry("yield_predictions", "YieldPredictions"),
        Map.entry("environment_readings", "EnvironmentReadings"),
        Map.entry("soil_readings", "SoilReadings"),
        Map.entry("alerts", "Alerts"),
        Map.entry("operation_logs", "OperationLogs"),
        Map.entry("inventory", "Inventory"),
        Map.entry("personnel", "Personnel"),
        Map.entry("farms", "Farms"),
        Map.entry("planting_cycles", "PlantingCycles"),
        Map.entry("weather_records", "WeatherRecords"),
        Map.entry("market_prices", "MarketPrices"),
        Map.entry("knowledge_documents", "KnowledgeDocuments"),
        Map.entry("model_versions", "ModelVersions")
    );

    @Override
    public void run(String... args) {
        try {
            Long userCount = (Long) em.createQuery("SELECT COUNT(u) FROM Users u").getSingleResult();
            if (userCount != null && userCount > 0) {
                log.info("[DataMigration] 数据库已有 {} 个用户，跳过数据迁移", userCount);
                return;
            }

            Path dataDir = Paths.get(seedDataPath);
            if (!Files.isDirectory(dataDir)) {
                log.warn("[DataMigration] 种子数据目录不存在: {}，跳过数据迁移", seedDataPath);
                return;
            }

            int totalImported = 0;
            for (Map.Entry<String, String> entry : TABLE_ENTITY_MAP.entrySet()) {
                String tableName = entry.getKey();
                String entityName = entry.getValue();
                File jsonFile = dataDir.resolve(tableName + ".json").toFile();

                if (!jsonFile.exists()) {
                    log.debug("[DataMigration] JSON 不存在: {}", jsonFile);
                    continue;
                }

                try {
                    int count = self.doImport(tableName, entityName, jsonFile);
                    totalImported += count;
                } catch (Exception e) {
                    log.warn("[DataMigration] 表 '{}' 导入失败(跳过): {}", tableName, e.getMessage());
                }
            }

            log.info("[DataMigration] 完成! 成功导入 {} 条记录到 MySQL", totalImported);

        } catch (Exception e) {
            log.warn("[DataMigration] 启动检查失败(不影响启动): {}", e.getMessage());
        }
    }

    @Transactional
    protected int doImport(String tableName, String entityName, File jsonFile) throws Exception {
        List<Map<String, Object>> rows = mapper.readValue(jsonFile,
                new TypeReference<List<Map<String, Object>>>() {});

        Class<?> entityClass = Class.forName("com.smartfarm.entity." + entityName);

        for (Map<String, Object> row : rows) {
            Object entity = entityClass.getDeclaredConstructor().newInstance();

            for (var field : entityClass.getDeclaredFields()) {
                field.setAccessible(true);
                String fieldName = field.getName();

                // 密码特殊处理
                if ("password".equals(fieldName) && "Users".equals(entityName)) {
                    field.set(entity, passwordEncoder.encode("123456"));
                    continue;
                }

                // 从 JSON 中查找匹配字段
                Object value = row.get(fieldName);
                if (value == null) {
                    value = row.get(camelCase(fieldName));
                }

                if (value != null) {
                    if (field.getType() == Double.class && value instanceof Number) {
                        field.set(entity, ((Number) value).doubleValue());
                    } else if (field.getType() == Boolean.class && value instanceof Boolean) {
                        field.set(entity, value);
                    } else if (field.getType() == String.class) {
                        // Map/List 值序列化为 JSON 字符串，普通值转字符串
                        if (value instanceof Map || value instanceof List) {
                            field.set(entity, mapper.writeValueAsString(value));
                        } else {
                            field.set(entity, value.toString());
                        }
                    } else {
                        try {
                            field.set(entity, value);
                        } catch (IllegalArgumentException ignored) {
                        }
                    }
                }
            }

            em.persist(entity);
        }

        em.flush();
        em.clear();
        log.info("[DataMigration] {}: 导入 {} 条", tableName, rows.size());
        return rows.size();
    }

    private String camelCase(String s) {
        if (s == null || s.isEmpty()) return s;
        StringBuilder sb = new StringBuilder();
        boolean up = false;
        for (char c : s.toCharArray()) {
            if (c == '_') { up = true; continue; }
            sb.append(up ? Character.toUpperCase(c) : c);
            up = false;
        }
        return sb.toString();
    }
}
