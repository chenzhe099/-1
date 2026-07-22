"""批量生成所有 11 个模块的 Controller"""
import os

DIR = os.path.join(os.path.dirname(__file__), '..', 'backend', 'src', 'main', 'java', 'com', 'smartfarm', 'controller')

controllers = {
    'DiseaseController.java': '''package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.DiseaseRecords;
import com.smartfarm.entity.PestKnowledgeBase;
import com.smartfarm.repository.DiseaseRecordsRepository;
import com.smartfarm.repository.PestKnowledgeBaseRepository;
import com.smartfarm.service.AiClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/v1/disease")
@RequiredArgsConstructor
public class DiseaseController {

    private final DiseaseRecordsRepository diseaseRepo;
    private final PestKnowledgeBaseRepository knowledgeRepo;
    private final AiClientService aiClient;

    @GetMapping("/records")
    public ApiResponse<List<DiseaseRecords>> getRecords() {
        return ApiResponse.ok(diseaseRepo.findAll());
    }

    @GetMapping("/knowledge")
    public ApiResponse<List<PestKnowledgeBase>> getKnowledge() {
        return ApiResponse.ok(knowledgeRepo.findAll());
    }

    @GetMapping("/knowledge/search")
    public ApiResponse<?> searchKnowledge(@RequestParam String name) {
        return ApiResponse.ok(knowledgeRepo.findAll().stream()
                .filter(k -> k.getName() != null && k.getName().contains(name))
                .findFirst().orElse(null));
    }

    @PostMapping("/diagnose")
    public ApiResponse<?> diagnose(@RequestParam("file") MultipartFile file) {
        Map<String, Object> result = aiClient.diagnoseDisease(file);
        return ApiResponse.ok(result);
    }

    @GetMapping("/trend")
    public ApiResponse<Map<String, Object>> getTrend() {
        List<DiseaseRecords> records = diseaseRepo.findAll();
        Map<String, Object> trend = new LinkedHashMap<>();
        List<String> labels = new ArrayList<>();
        List<Integer> disease = new ArrayList<>();
        List<Integer> pest = new ArrayList<>();
        for (DiseaseRecords r : records) {
            if (r.getDetectedAt() != null) {
                labels.add(r.getDetectedAt().substring(0, Math.min(10, r.getDetectedAt().length())));
                disease.add(r.getDiseaseName() != null && r.getDiseaseName().contains("病") ? 1 : 0);
                pest.add(r.getDiseaseName() != null && r.getDiseaseName().contains("虫") ? 1 : 0);
            }
        }
        trend.put("labels", labels);
        trend.put("disease", disease.stream().mapToInt(Integer::intValue).boxed().toList());
        trend.put("pest", pest.stream().mapToInt(Integer::intValue).boxed().toList());
        return ApiResponse.ok(trend);
    }
}
''',

    'FarmingController.java': '''package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import com.smartfarm.service.AiClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/farming")
@RequiredArgsConstructor
public class FarmingController {

    private final IrrigationPlansRepository irrigationRepo;
    private final FertilizationPlansRepository fertilizationRepo;
    private final FarmingTasksRepository taskRepo;
    private final FieldsRepository fieldRepo;
    private final AiClientService aiClient;

    @GetMapping("/irrigation")
    public ApiResponse<List<IrrigationPlans>> getIrrigation() {
        return ApiResponse.ok(irrigationRepo.findAll());
    }

    @GetMapping("/fertilization")
    public ApiResponse<List<FertilizationPlans>> getFertilization() {
        return ApiResponse.ok(fertilizationRepo.findAll());
    }

    @GetMapping("/fields")
    public ApiResponse<List<Fields>> getFields() {
        return ApiResponse.ok(fieldRepo.findAll());
    }

    @GetMapping("/tasks")
    public ApiResponse<List<FarmingTasks>> getTasks() {
        return ApiResponse.ok(taskRepo.findAll());
    }

    @PostMapping("/tasks")
    public ApiResponse<FarmingTasks> createTask(@RequestBody FarmingTasks task) {
        if (task.getId() == null) task.setId("task_" + System.currentTimeMillis());
        return ApiResponse.ok(taskRepo.save(task));
    }

    @PutMapping("/tasks/{id}")
    public ApiResponse<FarmingTasks> updateTask(@PathVariable String id, @RequestBody FarmingTasks task) {
        task.setId(id);
        return ApiResponse.ok(taskRepo.save(task));
    }

    @DeleteMapping("/tasks/{id}")
    public ApiResponse<?> deleteTask(@PathVariable String id) {
        taskRepo.deleteById(id);
        return ApiResponse.ok("删除成功", null);
    }

    @PostMapping("/irrigation/{id}/execute")
    public ApiResponse<?> executeIrrigation(@PathVariable String id) {
        irrigationRepo.findById(id).ifPresent(p -> {
            p.setStatus("executing");
            irrigationRepo.save(p);
        });
        return ApiResponse.ok("灌溉已启动", null);
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("irrigationTotal", irrigationRepo.findAll().stream()
                .mapToDouble(p -> p.getWaterVolume() != null ? p.getWaterVolume() : 0).sum());
        stats.put("fertilizationCount", fertilizationRepo.count());
        return ApiResponse.ok(stats);
    }
}
''',

    'PredictionController.java': '''package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/prediction")
@RequiredArgsConstructor
public class PredictionController {

    private final YieldPredictionsRepository yieldRepo;
    private final PlantingCyclesRepository cycleRepo;
    private final AlertsRepository alertRepo;

    @GetMapping("/yield")
    public ApiResponse<Map<String, Object>> getYield() {
        List<YieldPredictions> data = yieldRepo.findAll();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("labels", data.stream().map(YieldPredictions::getMonth).collect(Collectors.toList()));
        result.put("actual", data.stream().map(YieldPredictions::getActual).collect(Collectors.toList()));
        result.put("predicted", data.stream().map(YieldPredictions::getPredicted).collect(Collectors.toList()));
        return ApiResponse.ok(result);
    }

    @GetMapping("/crops")
    public ApiResponse<List<PlantingCycles>> getCrops() {
        return ApiResponse.ok(cycleRepo.findAll());
    }

    @GetMapping("/calendar")
    public ApiResponse<List<Map<String, Object>>> getCalendar() {
        return ApiResponse.ok(cycleRepo.findAll().stream().map(c -> {
            Map<String, Object> m = new HashMap<>();
            m.put("cropName", c.getCropName());
            m.put("fieldCode", c.getFieldId());
            m.put("scheduledTime", c.getExpectedHarvestDate());
            return m;
        }).collect(Collectors.toList()));
    }

    @GetMapping("/risks")
    public ApiResponse<?> getRisks() {
        return ApiResponse.ok(alertRepo.findByIsResolved(false));
    }
}
''',

    'ManagementController.java': '''package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/management")
@RequiredArgsConstructor
public class ManagementController {

    private final FarmingTasksRepository taskRepo;
    private final PersonnelRepository personnelRepo;
    private final InventoryRepository inventoryRepo;
    private final FarmsRepository farmRepo;
    private final PlantingCyclesRepository cycleRepo;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("recordCount", taskRepo.count());
        stats.put("personnelCount", personnelRepo.count());
        stats.put("deviceCount", 0);
        stats.put("inventoryValue", "¥45,800");
        return ApiResponse.ok(stats);
    }

    @GetMapping("/records")
    public ApiResponse<List<FarmingTasks>> getRecords() {
        return ApiResponse.ok(taskRepo.findAll());
    }

    @GetMapping("/personnel")
    public ApiResponse<List<Personnel>> getPersonnel() {
        return ApiResponse.ok(personnelRepo.findAll());
    }

    @GetMapping("/inventory")
    public ApiResponse<List<Inventory>> getInventory() {
        return ApiResponse.ok(inventoryRepo.findAll());
    }

    @GetMapping("/farms")
    public ApiResponse<List<Farms>> getFarms() {
        return ApiResponse.ok(farmRepo.findAll());
    }

    @GetMapping("/farms/{id}")
    public ApiResponse<Farms> getFarm(@PathVariable String id) {
        return ApiResponse.ok(farmRepo.findById(id).orElse(null));
    }

    @GetMapping("/cycles")
    public ApiResponse<List<PlantingCycles>> getCycles() {
        return ApiResponse.ok(cycleRepo.findAll());
    }
}
''',

    'DeviceController.java': '''package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DevicesRepository deviceRepo;
    private final MaintenanceRecordsRepository maintenanceRepo;

    @GetMapping("/summary")
    public ApiResponse<Map<String, Object>> getSummary() {
        Map<String, Object> s = new HashMap<>();
        s.put("total", deviceRepo.count());
        s.put("online", deviceRepo.findByStatus("online").size());
        s.put("fault", deviceRepo.findByStatus("fault").size());
        s.put("maintenance", deviceRepo.findByStatus("maintenance").size());
        return ApiResponse.ok(s);
    }

    @GetMapping
    public ApiResponse<List<Devices>> getDevices() {
        return ApiResponse.ok(deviceRepo.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Devices> getDevice(@PathVariable String id) {
        return ApiResponse.ok(deviceRepo.findById(id).orElse(null));
    }

    @PutMapping("/{id}")
    public ApiResponse<Devices> updateDevice(@PathVariable String id, @RequestBody Devices device) {
        device.setId(id);
        return ApiResponse.ok(deviceRepo.save(device));
    }

    @GetMapping("/maintenance")
    public ApiResponse<List<MaintenanceRecords>> getMaintenance() {
        return ApiResponse.ok(maintenanceRepo.findAll());
    }

    @PostMapping("/maintenance")
    public ApiResponse<MaintenanceRecords> createMaintenance(@RequestBody MaintenanceRecords record) {
        if (record.getId() == null) record.setId("mr_" + System.currentTimeMillis());
        return ApiResponse.ok(maintenanceRepo.save(record));
    }
}
''',

    'TraceabilityController.java': '''package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/traceability")
@RequiredArgsConstructor
public class TraceabilityController {

    private final ProductsRepository productRepo;
    private final ProductionTimelineRepository timelineRepo;
    private final QualityCertificationsRepository certRepo;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        Map<String, Object> s = new HashMap<>();
        s.put("productCount", productRepo.count());
        s.put("recordCount", timelineRepo.count());
        s.put("scanCount", 5234);
        s.put("certCount", certRepo.count());
        return ApiResponse.ok(s);
    }

    @GetMapping("/products")
    public ApiResponse<List<Products>> getProducts() {
        return ApiResponse.ok(productRepo.findAll());
    }

    @GetMapping("/products/{id}")
    public ApiResponse<Products> getProduct(@PathVariable String id) {
        return ApiResponse.ok(productRepo.findById(id).orElse(null));
    }

    @GetMapping("/products/{id}/timeline")
    public ApiResponse<List<ProductionTimeline>> getTimeline(@PathVariable String id) {
        return ApiResponse.ok(timelineRepo.findByProductId(id));
    }

    @GetMapping("/products/{id}/certifications")
    public ApiResponse<List<QualityCertifications>> getCertifications(@PathVariable String id) {
        return ApiResponse.ok(certRepo.findByProductId(id));
    }

    @PostMapping("/products")
    public ApiResponse<Products> addProduct(@RequestBody Products product) {
        if (product.getId() == null) product.setId("prod_" + System.currentTimeMillis());
        return ApiResponse.ok(productRepo.save(product));
    }
}
''',

    'PermissionController.java': '''package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/permission")
@RequiredArgsConstructor
public class PermissionController {

    private final UsersRepository userRepo;
    private final RolesRepository roleRepo;
    private final OperationLogsRepository logRepo;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        Map<String, Object> s = new HashMap<>();
        s.put("totalUsers", userRepo.count());
        s.put("adminCount", userRepo.countByRole("admin"));
        s.put("technicianCount", userRepo.countByRole("technician"));
        s.put("farmerCount", userRepo.countByRole("farmer"));
        return ApiResponse.ok(s);
    }

    @GetMapping("/users")
    public ApiResponse<List<Users>> getUsers() {
        return ApiResponse.ok(userRepo.findAll());
    }

    @PostMapping("/users")
    public ApiResponse<Users> addUser(@RequestBody Users user) {
        if (user.getId() == null) user.setId("u_" + System.currentTimeMillis());
        if (user.getPassword() == null) user.setPassword(passwordEncoder.encode("123456"));
        else user.setPassword(passwordEncoder.encode(user.getPassword()));
        return ApiResponse.ok(userRepo.save(user));
    }

    @PutMapping("/users/{id}")
    public ApiResponse<Users> editUser(@PathVariable String id, @RequestBody Users user) {
        userRepo.findById(id).ifPresent(existing -> {
            user.setId(id);
            user.setPassword(existing.getPassword());
            userRepo.save(user);
        });
        return ApiResponse.ok(userRepo.findById(id).orElse(null));
    }

    @PutMapping("/users/{id}/reset-password")
    public ApiResponse<?> resetPassword(@PathVariable String id) {
        userRepo.findById(id).ifPresent(u -> {
            u.setPassword(passwordEncoder.encode("123456"));
            userRepo.save(u);
        });
        return ApiResponse.ok("密码已重置", null);
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<?> disableUser(@PathVariable String id) {
        userRepo.findById(id).ifPresent(u -> {
            u.setStatus("disabled");
            userRepo.save(u);
        });
        return ApiResponse.ok("用户已禁用", null);
    }

    @GetMapping("/roles")
    public ApiResponse<List<Roles>> getRoles() {
        return ApiResponse.ok(roleRepo.findAll());
    }

    @GetMapping("/logs")
    public ApiResponse<List<OperationLogs>> getLogs() {
        return ApiResponse.ok(logRepo.findAll());
    }
}
''',

    'WeatherController.java': '''package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherRecordsRepository weatherRepo;
    private final AlertsRepository alertRepo;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        List<WeatherRecords> records = weatherRepo.findAll();
        WeatherRecords today = records.isEmpty() ? null : records.get(records.size() - 1);
        Map<String, Object> s = new HashMap<>();
        s.put("todayTemp", today != null ? today.getTemperatureHigh() + "°C / " + today.getTemperatureLow() + "°C" : "--");
        s.put("tempChange", "+2°C");
        s.put("todayRainfall", today != null ? today.getRainfallMm() + "mm" : "--");
        s.put("rainfallDesc", "预计今日无降雨");
        s.put("todayHumidity", today != null ? today.getHumidity() + "%" : "--");
        s.put("todayWind", today != null ? today.getWindSpeed() + " km/h" : "--");
        s.put("conditionLabel", "晴");
        return ApiResponse.ok(s);
    }

    @GetMapping("/trend")
    public ApiResponse<Map<String, Object>> getTrend() {
        List<WeatherRecords> records = weatherRepo.findAll();
        Map<String, Object> trend = new LinkedHashMap<>();
        trend.put("labels", records.stream().map(WeatherRecords::getDate).toList());
        trend.put("temperatureHigh", records.stream().map(WeatherRecords::getTemperatureHigh).toList());
        trend.put("temperatureLow", records.stream().map(WeatherRecords::getTemperatureLow).toList());
        trend.put("rainfall", records.stream().map(WeatherRecords::getRainfallMm).toList());
        return ApiResponse.ok(trend);
    }

    @GetMapping("/forecast")
    public ApiResponse<List<WeatherRecords>> getForecast() {
        return ApiResponse.ok(weatherRepo.findAll().stream().limit(7).toList());
    }

    @GetMapping("/alerts")
    public ApiResponse<List<Alerts>> getAlerts() {
        return ApiResponse.ok(alertRepo.findByIsResolved(false));
    }
}
''',

    'MarketController.java': '''package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketPricesRepository marketRepo;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        List<MarketPrices> all = marketRepo.findAll();
        Set<String> crops = all.stream().map(MarketPrices::getCropName).collect(Collectors.toSet());
        double avg = all.stream().mapToDouble(p -> p.getPricePerKg() != null ? p.getPricePerKg() : 0).average().orElse(0);
        Map<String, Object> s = new HashMap<>();
        s.put("cropCount", crops.size());
        s.put("avgPrice", String.format("%.2f元/kg", avg));
        s.put("maxUpCrop", "番茄");
        s.put("maxDownCrop", "黄瓜");
        return ApiResponse.ok(s);
    }

    @GetMapping("/trend")
    public ApiResponse<Map<String, Object>> getTrend(@RequestParam(defaultValue = "all") String crop) {
        List<MarketPrices> all = marketRepo.findAll();
        Map<String, List<MarketPrices>> byCrop = all.stream()
                .collect(Collectors.groupingBy(MarketPrices::getCropName));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("crops", new ArrayList<>(byCrop.keySet()));
        result.put("series", byCrop);
        return ApiResponse.ok(result);
    }

    @GetMapping("/alerts")
    public ApiResponse<List<Map<String, Object>>> getAlerts() {
        return ApiResponse.ok(new ArrayList<>());
    }
}
''',

    'MonitorController.java': '''package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/monitor")
@RequiredArgsConstructor
public class MonitorController {

    private final ModelVersionsRepository modelRepo;
    private final DiseaseRecordsRepository diseaseRepo;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        List<ModelVersions> models = modelRepo.findAll();
        Map<String, Object> s = new HashMap<>();
        s.put("activeCount", models.stream().filter(m -> "active".equals(m.getStatus())).count());
        s.put("avgAccuracy",
                String.format("%.1f%%", models.stream()
                        .filter(m -> m.getAccuracy() != null)
                        .mapToDouble(ModelVersions::getAccuracy)
                        .average().orElse(0)));
        s.put("driftWarnings", models.stream()
                .filter(m -> m.getDriftScore() != null && m.getDriftScore() > 0.2).count());
        s.put("avgUnknownRate",
                String.format("%.1f%%", models.stream()
                        .filter(m -> m.getUnknownRate() != null)
                        .mapToDouble(ModelVersions::getUnknownRate)
                        .average().orElse(0)));
        return ApiResponse.ok(s);
    }

    @GetMapping("/versions")
    public ApiResponse<List<ModelVersions>> getVersions() {
        return ApiResponse.ok(modelRepo.findAll());
    }

    @GetMapping("/performance")
    public ApiResponse<Map<String, Object>> getPerformance() {
        List<ModelVersions> models = modelRepo.findAll();
        Map<String, Object> perf = new LinkedHashMap<>();
        perf.put("labels", models.stream().map(m -> m.getModelName() + " " + m.getVersion()).toList());
        perf.put("accuracy", models.stream().map(ModelVersions::getAccuracy).toList());
        perf.put("drift", models.stream().map(m -> m.getDriftScore() != null ? m.getDriftScore() : 0).toList());
        return ApiResponse.ok(perf);
    }
}
''',

    'FileUploadController.java': '''package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/files")
public class FileUploadController {

    @Value("${minio.bucket:smartfarm-images}")
    private String bucket;

    private final Path uploadDir = Paths.get(System.getProperty("java.io.tmpdir"), "smartfarm-uploads");

    @PostMapping("/upload")
    public ApiResponse<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) {
        try {
            Files.createDirectories(uploadDir);
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path target = uploadDir.resolve(filename);
            file.transferTo(target.toFile());

            Map<String, Object> result = new HashMap<>();
            result.put("filename", filename);
            result.put("size", file.getSize());
            result.put("url", "/api/v1/files/" + filename);
            result.put("contentType", file.getContentType());

            return ApiResponse.ok(result);
        } catch (IOException e) {
            log.error("File upload failed", e);
            return ApiResponse.fail(500, "文件上传失败: " + e.getMessage());
        }
    }

    @GetMapping("/{filename}")
    public ApiResponse<Map<String, String>> getFile(@PathVariable String filename) {
        return ApiResponse.ok(Map.of("filename", filename, "status", "available"));
    }
}
''',
}

for name, content in controllers.items():
    path = os.path.join(DIR, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  Controller: {name}')

print(f'\\nDone! Created {len(controllers)} controllers.')
