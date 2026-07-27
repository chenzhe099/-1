package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 通用 CRUD 控制器
 * 支持对所有 27 张表的增删改查操作
 * <p>
 * GET    /api/v1/{table}         - 列表
 * GET    /api/v1/{table}/{id}    - 详情（支持 String/Long 两种 ID 类型）
 * POST   /api/v1/{table}         - 新增
 * PUT    /api/v1/{table}/{id}    - 更新
 * DELETE /api/v1/{table}/{id}    - 删除
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@Tag(name = "通用 CRUD", description = "所有业务表的通用增删改查接口，通过表名动态路由")
public class GenericCrudController {

    @PersistenceContext
    private EntityManager em;

    private static final java.util.Set<String> ALLOWED_TABLES = java.util.Set.of(
        "users", "roles", "crops", "fields",
        "farming_tasks", "devices", "irrigation_plans", "fertilization_plans",
        "maintenance_records", "disease_records", "pest_knowledge_base",
        "products", "production_timeline", "quality_certifications",
        "yield_predictions", "environment_readings", "soil_readings",
        "alerts", "operation_logs", "inventory", "personnel",
        "farms", "planting_cycles", "weather_records", "market_prices",
        "knowledge_documents", "model_versions", "observations", "agent_runs"
    );

    private String toCamel(String snake) {
        StringBuilder sb = new StringBuilder();
        boolean up = true;
        for (char c : snake.toCharArray()) {
            if (c == '_') { up = true; continue; }
            sb.append(up ? Character.toUpperCase(c) : c);
            up = false;
        }
        return sb.toString();
    }

    private String entityName(String table) {
        return toCamel(table);
    }

    /**
     * 根据 ID 查找实体，兼容 BIGINT（Long）和 VARCHAR（String）两种 ID 类型
     */
    private Object findEntity(String table, String id) {
        Class<?> clazz = getEntityClass(table);
        Object entity = null;

        // 1. 先尝试 String ID 查找
        entity = em.find(clazz, id);

        // 2. 若为 null 且 id 是数字字符串，尝试 Long 类型查找
        if (entity == null) {
            try {
                Long longId = Long.parseLong(id);
                entity = em.find(clazz, longId);
            } catch (NumberFormatException ignored) {
                // id 不是数字，忽略 Long 尝试
            }
        }

        return entity;
    }

    @GetMapping("/{table}")
    @Operation(summary = "获取表的所有记录", description = "根据表名查询该表的所有数据记录")
    @SuppressWarnings("unchecked")
    public ApiResponse<List<?>> list(
            @Parameter(description = "表名，如 users, devices, fields") @PathVariable String table) {
        checkTable(table);
        log.debug("查询表 {} 的所有记录", table);
        List<?> result = em.createQuery("SELECT e FROM " + entityName(table) + " e").getResultList();
        return ApiResponse.ok(result);
    }

    @GetMapping("/{table}/{id}")
    @Operation(summary = "获取单条记录", description = "根据表名和ID获取单条记录，兼容 BIGINT 和 VARCHAR 两种 ID 类型")
    public ApiResponse<?> getById(
            @Parameter(description = "表名") @PathVariable String table,
            @Parameter(description = "记录ID（支持数字或字符串）") @PathVariable String id) {
        checkTable(table);
        Object entity = findEntity(table, id);
        if (entity == null) {
            log.warn("未找到记录: table={}, id={}", table, id);
            throw new ResourceNotFoundException(table, id);
        }
        return ApiResponse.ok(entity);
    }

    @PostMapping("/{table}")
    @Transactional
    @Operation(summary = "新增记录", description = "在指定表中新增一条记录")
    public ApiResponse<?> create(
            @Parameter(description = "表名") @PathVariable String table,
            @Parameter(description = "JSON 格式的实体字段") @RequestBody Map<String, Object> body) {
        checkTable(table);
        String entityName = entityName(table);
        try {
            Class<?> clazz = getEntityClass(table);
            Object entity = clazz.getDeclaredConstructor().newInstance();

            for (var field : clazz.getDeclaredFields()) {
                if ("password".equals(field.getName())) continue;
                field.setAccessible(true);
                if (body.containsKey(field.getName())) {
                    field.set(entity, body.get(field.getName()));
                }
            }

            em.persist(entity);
            em.flush();
            log.info("创建成功: table={}, entity={}", table, entity);
            return ApiResponse.ok(entity);
        } catch (Exception e) {
            log.error("[{}] 创建失败: {}", entityName, e.getMessage(), e);
            return ApiResponse.fail(500, "创建失败: " + e.getMessage());
        }
    }

    @PutMapping("/{table}/{id}")
    @Transactional
    @Operation(summary = "更新记录", description = "根据表名和ID更新指定记录（不更新 id 和 password 字段）")
    public ApiResponse<?> update(
            @Parameter(description = "表名") @PathVariable String table,
            @Parameter(description = "记录ID") @PathVariable String id,
            @Parameter(description = "JSON 格式的待更新字段") @RequestBody Map<String, Object> body) {
        checkTable(table);
        Object entity = findEntity(table, id);
        if (entity == null) {
            log.warn("更新失败 - 记录不存在: table={}, id={}", table, id);
            throw new ResourceNotFoundException(table, id);
        }

        try {
            Class<?> clazz = entity.getClass();
            for (var field : clazz.getDeclaredFields()) {
                if ("id".equals(field.getName()) || "password".equals(field.getName())) continue;
                field.setAccessible(true);
                if (body.containsKey(field.getName())) {
                    field.set(entity, body.get(field.getName()));
                }
            }
            em.merge(entity);
            em.flush();
            log.info("更新成功: table={}, id={}", table, id);
            return ApiResponse.ok(entity);
        } catch (Exception e) {
            log.error("[{}] 更新失败, id={}: {}", entityName(table), id, e.getMessage(), e);
            return ApiResponse.fail(500, "更新失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{table}/{id}")
    @Transactional
    @Operation(summary = "删除记录", description = "根据表名和ID删除指定记录")
    public ApiResponse<?> delete(
            @Parameter(description = "表名") @PathVariable String table,
            @Parameter(description = "记录ID") @PathVariable String id) {
        checkTable(table);
        Object entity = findEntity(table, id);
        if (entity == null) {
            log.warn("删除失败 - 记录不存在: table={}, id={}", table, id);
            throw new ResourceNotFoundException(table, id);
        }
        em.remove(entity);
        em.flush();
        log.info("删除成功: table={}, id={}", table, id);
        return ApiResponse.ok("删除成功", null);
    }

    private void checkTable(String table) {
        if (!ALLOWED_TABLES.contains(table)) {
            throw new ResourceNotFoundException("Table not found: " + table);
        }
    }

    private Class<?> getEntityClass(String table) {
        try {
            return Class.forName("com.smartfarm.entity." + entityName(table));
        } catch (ClassNotFoundException e) {
            log.error("实体类未找到: {}", entityName(table));
            throw new ResourceNotFoundException("Entity not found for table: " + table);
        }
    }
}
