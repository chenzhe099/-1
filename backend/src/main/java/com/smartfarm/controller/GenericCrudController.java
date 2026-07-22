package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.exception.ResourceNotFoundException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 通用 CRUD 控制器
 * 支持对所有 27 张表的增删改查操作
 *
 * GET    /api/v1/{table}         - 列表
 * GET    /api/v1/{table}/{id}    - 详情
 * POST   /api/v1/{table}         - 新增
 * PUT    /api/v1/{table}/{id}    - 更新
 * DELETE /api/v1/{table}/{id}    - 删除
 */
@RestController
@RequestMapping("/api/v1")
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
        "knowledge_documents", "model_versions"
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

    @GetMapping("/{table}")
    @SuppressWarnings("unchecked")
    public ApiResponse<List<?>> list(@PathVariable String table) {
        checkTable(table);
        List<?> result = em.createQuery("SELECT e FROM " + entityName(table) + " e").getResultList();
        return ApiResponse.ok(result);
    }

    @GetMapping("/{table}/{id}")
    public ApiResponse<?> getById(@PathVariable String table, @PathVariable String id) {
        checkTable(table);
        Object entity = em.find(getEntityClass(table), id);
        if (entity == null) {
            throw new ResourceNotFoundException(table, id);
        }
        return ApiResponse.ok(entity);
    }

    @PostMapping("/{table}")
    @Transactional
    public ApiResponse<?> create(@PathVariable String table, @RequestBody Map<String, Object> body) {
        checkTable(table);
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
            return ApiResponse.ok(entity);
        } catch (Exception e) {
            return ApiResponse.fail(500, "创建失败: " + e.getMessage());
        }
    }

    @PutMapping("/{table}/{id}")
    @Transactional
    public ApiResponse<?> update(@PathVariable String table, @PathVariable String id,
                                  @RequestBody Map<String, Object> body) {
        checkTable(table);
        Object entity = em.find(getEntityClass(table), id);
        if (entity == null) {
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
            return ApiResponse.ok(entity);
        } catch (Exception e) {
            return ApiResponse.fail(500, "更新失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{table}/{id}")
    @Transactional
    public ApiResponse<?> delete(@PathVariable String table, @PathVariable String id) {
        checkTable(table);
        Object entity = em.find(getEntityClass(table), id);
        if (entity == null) {
            throw new ResourceNotFoundException(table, id);
        }
        em.remove(entity);
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
            throw new ResourceNotFoundException("Entity not found for table: " + table);
        }
    }
}
