package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 天气管理控制器
 * 提供天气数据统计、天气趋势、天气预报及天气预警功能
 */
@RestController
@RequestMapping("/api/v1/weather")
@RequiredArgsConstructor
@Tag(name = "天气管理", description = "天气数据统计、趋势分析、天气预报及天气预警")
public class WeatherController {

    private final WeatherRecordsRepository weatherRepo;
    private final AlertsRepository alertRepo;

    @GetMapping("/stats")
    @Operation(summary = "天气统计", description = "返回今日温度、降雨量、湿度、风速等天气统计数据")
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
    @Operation(summary = "天气趋势", description = "返回天气历史趋势数据（温度、降雨量等）")
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
    @Operation(summary = "天气预报", description = "返回最近 7 天的天气预报数据")
    public ApiResponse<List<WeatherRecords>> getForecast() {
        return ApiResponse.ok(weatherRepo.findAll().stream().limit(7).toList());
    }

    @GetMapping("/alerts")
    @Operation(summary = "天气预警", description = "返回未解决的天气相关预警信息")
    public ApiResponse<List<Alerts>> getAlerts() {
        return ApiResponse.ok(alertRepo.findByIsResolved(false));
    }
}
