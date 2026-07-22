package com.smartfarm.controller;

import com.smartfarm.dto.ApiResponse;
import com.smartfarm.dto.PriceRecordDTO;
import com.smartfarm.service.MarketPriceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
@Tag(name = "市场价格", description = "农产品市场价格监测与行情分析")
public class MarketPriceController {

    private final MarketPriceService marketService;

    @GetMapping("/stats")
    @Operation(summary = "市场统计概览")
    public ApiResponse<Map<String, Object>> getStats() {
        return ApiResponse.success(marketService.getMarketStats());
    }

    @GetMapping("/trend")
    @Operation(summary = "价格走势数据")
    public ApiResponse<Map<String, List<PriceRecordDTO>>> getTrend(
            @RequestParam(required = false) String crop) {
        return ApiResponse.success(marketService.getPriceTrend(crop));
    }

    @GetMapping("/today")
    @Operation(summary = "今日价格明细")
    public ApiResponse<List<PriceRecordDTO>> getTodayPrices() {
        return ApiResponse.success(marketService.getTodayPrices());
    }
}
