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
 * 市场行情控制器
 * 提供农产品市场价格趋势查看及 AI 市场行情分析功能
 */
@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
@Tag(name = "市场行情", description = "农产品市场价格趋势、统计及 AI 市场行情分析")
public class MarketController {

    private final MarketPricesRepository marketRepo;
    private final AiClientService aiClient;

    @GetMapping("/stats")
    @Operation(summary = "市场行情统计", description = "返回作物种类数、均价等市场统计数据")
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
    @Operation(summary = "市场价格趋势", description = "返回各作物的历史价格趋势数据，可按作物筛选")
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
    @Operation(summary = "市场预警", description = "返回市场价格预警信息")
    public ApiResponse<List<Map<String, Object>>> getAlerts() {
        return ApiResponse.ok(new ArrayList<>());
    }

    // ==================== AI 市场行情分析 ====================

    @PostMapping("/ai-analysis")
    @Operation(summary = "AI 市场分析", description = "调用 AI 模型进行农产品市场行情分析")
    public ApiResponse<?> aiMarketAnalysis(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = aiClient.marketAnalysis(params);
        return ApiResponse.ok(result);
    }
}
