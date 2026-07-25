package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import com.smartfarm.service.AiClientService;
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
    private final AiClientService aiClient;

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

    // ==================== AI 产量预测 ====================

    @PostMapping("/yield/ai-predict")
    public ApiResponse<?> aiPredictYield(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = aiClient.predictYield(params);
        return ApiResponse.ok(result);
    }
}
