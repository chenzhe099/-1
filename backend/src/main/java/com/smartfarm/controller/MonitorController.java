package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import com.smartfarm.service.AiClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/monitor")
@RequiredArgsConstructor
public class MonitorController {

    private final ModelVersionsRepository modelRepo;
    private final DiseaseRecordsRepository diseaseRepo;
    private final AiClientService aiClient;

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

    // ==================== AI IoT 设备异常检测 ====================

    @PostMapping("/anomaly/detect")
    public ApiResponse<?> detectAnomaly(@RequestBody List<Map<String, Object>> timeSeriesData) {
        Map<String, Object> result = aiClient.detectAnomaly(timeSeriesData);
        return ApiResponse.ok(result);
    }
}
