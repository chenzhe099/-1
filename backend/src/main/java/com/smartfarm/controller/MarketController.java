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
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketPricesRepository marketRepo;
    private final AiClientService aiClient;

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

    // ==================== AI 市场行情分析 ====================

    @PostMapping("/ai-analysis")
    public ApiResponse<?> aiMarketAnalysis(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = aiClient.marketAnalysis(params);
        return ApiResponse.ok(result);
    }
}
