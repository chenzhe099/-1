"""
生成 Spring Boot Service 和 Controller 类
"""
import os

SERVICE_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend', 'src', 'main', 'java', 'com', 'smartfarm', 'service')
CONTROLLER_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend', 'src', 'main', 'java', 'com', 'smartfarm', 'controller')

os.makedirs(SERVICE_DIR, exist_ok=True)
os.makedirs(CONTROLLER_DIR, exist_ok=True)

# ===========================
# 1. AiClientService
# ===========================
ai_client = '''package com.smartfarm.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@Service
public class AiClientService {

    private final RestTemplate restTemplate;
    private final String aiServiceUrl;

    public AiClientService(@Value("${ai-service.url}") String aiServiceUrl) {
        this.restTemplate = new RestTemplate();
        this.aiServiceUrl = aiServiceUrl;
    }

    /**
     * 调用 AI 服务进行病虫害图片识别
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> diagnoseDisease(MultipartFile image) {
        try {
            String url = aiServiceUrl + "/api/v1/diagnosis";
            ByteArrayResource resource = new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", resource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("AI diagnosis failed: {}", e.getMessage());
            return Map.of(
                "diseaseName", "未知病害",
                "confidence", 0.0,
                "isUnknown", true,
                "error", e.getMessage()
            );
        }
    }

    /**
     * RAG 检索农技规范
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> ragSearch(String query) {
        try {
            String url = aiServiceUrl + "/api/v1/rag/search";
            Map<String, String> request = Map.of("query", query);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("RAG search failed: {}", e.getMessage());
            return Map.of("results", java.util.Collections.emptyList());
        }
    }

    /**
     * Agent 综合决策
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> agentDecision(Map<String, Object> params) {
        try {
            String url = aiServiceUrl + "/api/v1/agent/decision";
            ResponseEntity<Map> response = restTemplate.postForEntity(url, params, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Agent decision failed: {}", e.getMessage());
            return Map.of(
                "recommendations", java.util.Collections.emptyList(),
                "riskLevel", "unknown"
            );
        }
    }
}
'''

# ===========================
# 2. AuthService
# ===========================
auth_service = '''package com.smartfarm.service;

import com.smartfarm.config.JwtTokenProvider;
import com.smartfarm.dto.request.LoginRequest;
import com.smartfarm.dto.response.LoginResponse;
import com.smartfarm.entity.Users;
import com.smartfarm.exception.BadRequestException;
import com.smartfarm.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsersRepository usersRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        Users user = usersRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("用户名或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("用户名或密码错误");
        }

        if ("disabled".equals(user.getStatus())) {
            throw new BadRequestException("账户已被禁用");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole());

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .role(user.getRole())
                .build();
    }
}
'''

# ===========================
# 3. AuthController
# ===========================
auth_controller = '''package com.smartfarm.controller;

import com.smartfarm.config.JwtTokenProvider;
import com.smartfarm.dto.request.LoginRequest;
import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.dto.response.LoginResponse;
import com.smartfarm.entity.Users;
import com.smartfarm.repository.UsersRepository;
import com.smartfarm.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UsersRepository usersRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> me(@AuthenticationPrincipal Users user) {
        if (user == null) {
            return ApiResponse.fail(401, "未登录");
        }
        return ApiResponse.ok(Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "displayName", user.getDisplayName(),
            "role", user.getRole(),
            "status", user.getStatus()
        ));
    }
}
'''

# ===========================
# 4. Dashboard Service + Controller
# ===========================
dashboard_service = '''package com.smartfarm.service;

import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FarmingTasksRepository taskRepo;
    private final DevicesRepository deviceRepo;
    private final AlertsRepository alertRepo;
    private final YieldPredictionsRepository yieldRepo;
    private final FieldsRepository fieldRepo;
    private final EnvironmentReadingsRepository envRepo;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalTasks = taskRepo.count();
        long pendingTasks = taskRepo.findByStatus("pending").size();
        stats.put("tasksToday", pendingTasks);
        stats.put("tasksChange", "+12%");
        stats.put("tasksTotal", totalTasks);

        long totalDevices = deviceRepo.count();
        long onlineDevices = deviceRepo.findByStatus("online").size();
        int onlineRate = totalDevices > 0 ? (int) (onlineDevices * 100 / totalDevices) : 0;
        stats.put("deviceOnlineRate", onlineRate);
        stats.put("deviceChange", "+2%");

        long alertCount = alertRepo.findByIsResolved(false).size();
        stats.put("alertCount", alertCount);
        stats.put("alertDesc", alertCount > 0 ? "需处理" : "无预警");

        double totalYield = yieldRepo.findAll().stream()
                .filter(y -> y.getPredicted() != null)
                .mapToDouble(y -> y.getPredicted() != null ? y.getPredicted() : 0)
                .sum();
        stats.put("monthlyYield", String.format("%.1f", totalYield));
        stats.put("yieldUnit", "吨");
        stats.put("yieldChange", "+8%");

        return stats;
    }

    public List<Map<String, Object>> getFieldStatusList() {
        return fieldRepo.findAll().stream().map(f -> {
            Map<String, Object> m = new HashMap<>();
            m.put("code", f.getCode());
            m.put("cropName", f.getCropName());
            m.put("status", f.getStatus());
            return m;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTodayTasks() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return taskRepo.findAll().stream()
                .filter(t -> t.getScheduledTime() != null && t.getScheduledTime().startsWith(today))
                .map(t -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", t.getId());
                    m.put("type", t.getType());
                    m.put("fieldCode", t.getFieldCode());
                    m.put("cropName", t.getCropName());
                    m.put("scheduledTime", t.getScheduledTime());
                    m.put("status", t.getStatus());
                    m.put("assignedTo", t.getAssignedTo());
                    m.put("priority", t.getPriority());
                    return m;
                }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAlertList() {
        return alertRepo.findByIsResolved(false).stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("title", a.getTitle());
            m.put("message", a.getMessage());
            m.put("severity", a.getSeverity());
            m.put("isRead", a.getIsRead());
            m.put("isResolved", a.getIsResolved());
            m.put("createdAt", a.getCreatedAt());
            return m;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getEnvironmentTrend() {
        List<EnvironmentReadings> readings = envRepo.findAll();
        Map<String, Object> trend = new HashMap<>();
        trend.put("labels", readings.stream().map(r -> {
            String ts = r.getTimestamp();
            return ts != null && ts.length() >= 16 ? ts.substring(11, 16) : ts;
        }).collect(Collectors.toList()));
        trend.put("temperature", readings.stream().map(EnvironmentReadings::getTemperature).collect(Collectors.toList()));
        trend.put("humidity", readings.stream().map(EnvironmentReadings::getHumidity).collect(Collectors.toList()));
        return trend;
    }
}
'''

dashboard_controller = '''package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ApiResponse<?> getStats() {
        return ApiResponse.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/fields")
    public ApiResponse<?> getFields() {
        return ApiResponse.ok(dashboardService.getFieldStatusList());
    }

    @GetMapping("/tasks/today")
    public ApiResponse<?> getTodayTasks() {
        return ApiResponse.ok(dashboardService.getTodayTasks());
    }

    @GetMapping("/alerts")
    public ApiResponse<?> getAlerts() {
        return ApiResponse.ok(dashboardService.getAlertList());
    }

    @GetMapping("/environment")
    public ApiResponse<?> getEnvironment() {
        return ApiResponse.ok(dashboardService.getEnvironmentTrend());
    }
}
'''

# ===========================
# 5. Generic CRUD Controller
# ===========================
generic_controller = '''package com.smartfarm.controller;

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
'''

# ===========================
# Write all files
# ===========================
files = {
    'AiClientService.java': ai_client,
    'AuthService.java': auth_service,
    'DashboardService.java': dashboard_service,
}

controller_files = {
    'AuthController.java': auth_controller,
    'DashboardController.java': dashboard_controller,
    'GenericCrudController.java': generic_controller,
}

for name, content in files.items():
    path = os.path.join(SERVICE_DIR, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  Service: {name}')

for name, content in controller_files.items():
    path = os.path.join(CONTROLLER_DIR, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  Controller: {name}')

print(f'\\nDone!')
