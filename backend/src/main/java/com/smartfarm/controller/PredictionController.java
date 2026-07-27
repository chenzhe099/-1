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
import java.util.stream.Collectors;

/**
 * 预测分析控制器
 * 提供产量预测、种植日历、风险预警及 AI 预测功能
 */
@RestController
@RequestMapping("/api/v1/prediction")
@RequiredArgsConstructor
@Tag(name = "预测分析", description = "产量预测、种植日历、风险预警及 AI 预测分析")
public class PredictionController {

    private final YieldPredictionsRepository yieldRepo;
    private final PlantingCyclesRepository cycleRepo;
    private final AlertsRepository alertRepo;
    private final AiClientService aiClient;

    @GetMapping("/yield")
    @Operation(summary = "获取产量预测数据", description = "返回各月的实际产量和预测产量数据")
    public ApiResponse<Map<String, Object>> getYield() {
        List<YieldPredictions> data = yieldRepo.findAll();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("labels", data.stream().map(YieldPredictions::getMonth).collect(Collectors.toList()));
        result.put("actual", data.stream().map(YieldPredictions::getActual).collect(Collectors.toList()));
        result.put("predicted", data.stream().map(YieldPredictions::getPredicted).collect(Collectors.toList()));
        return ApiResponse.ok(result);
    }

    @GetMapping("/crops")
    @Operation(summary = "获取种植周期", description = "返回所有作物的种植周期数据")
    public ApiResponse<List<PlantingCycles>> getCrops() {
        return ApiResponse.ok(cycleRepo.findAll());
    }

    @GetMapping("/calendar")
    @Operation(summary = "获取种植日历", description = "返回种植日历数据（作物名称、地块、预计收获时间）")
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
    @Operation(summary = "获取风险预警", description = "返回所有未解决的风险预警列表")
    public ApiResponse<?> getRisks() {
        return ApiResponse.ok(alertRepo.findByIsResolved(false));
    }

    // ==================== AI 产量预测 ====================

    @PostMapping("/yield/ai-predict")
    @Operation(summary = "AI 产量预测", description = "调用 AI 模型生成作物产量预测")
    public ApiResponse<?> aiPredictYield(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = aiClient.predictYield(params);
        return ApiResponse.ok(result);
    }
}
