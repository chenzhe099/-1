package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import com.smartfarm.service.AiClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * AI 模型监控控制器
 * 提供模型版本管理、性能监控及 AI 异常检测功能
 */
@RestController
@RequestMapping("/api/v1/monitor")
@RequiredArgsConstructor
@Tag(name = "模型监控", description = "AI 模型版本管理、性能指标监控及 IoT 异常检测")
public class MonitorController {

    private final ModelVersionsRepository modelRepo;
    private final DiseaseRecordsRepository diseaseRepo;
    private final AiClientService aiClient;

    @GetMapping("/stats")
    @Operation(summary = "模型监控统计", description = "返回活跃模型数、平均准确率、漂移警告数等统计")
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
    @Operation(summary = "获取模型版本列表", description = "返回所有 AI 模型版本信息")
    public ApiResponse<List<ModelVersions>> getVersions() {
        return ApiResponse.ok(modelRepo.findAll());
    }

    @GetMapping("/performance")
    @Operation(summary = "获取模型性能数据", description = "返回各模型的准确率和漂移评分对比数据")
    public ApiResponse<Map<String, Object>> getPerformance() {
        List<ModelVersions> models = modelRepo.findAll();
        Map<String, Object> perf = new LinkedHashMap<>();
        perf.put("labels", models.stream().map(m -> m.getModelName() + " " + m.getVersion()).toList());
        perf.put("accuracy", models.stream().map(ModelVersions::getAccuracy).toList());
        perf.put("drift", models.stream().map(m -> m.getDriftScore() != null ? m.getDriftScore() : 0).toList());
        return ApiResponse.ok(perf);
    }

    // ==================== AI IoT 设备异常检测 ====================

    @PostMapping("/anomaly/detect")
    @Operation(summary = "AI 异常检测", description = "分析传感器时序数据，调用 AI 检测设备异常")
    public ApiResponse<?> detectAnomaly(@RequestBody List<Map<String, Object>> timeSeriesData) {
        Map<String, Object> result = aiClient.detectAnomaly(timeSeriesData);
        return ApiResponse.ok(result);
    }
}
