package com.smartfarm.controller;

import com.smartfarm.dto.ApiResponse;
import com.smartfarm.dto.WeatherDTO;
import com.smartfarm.entity.WeatherRecord;
import com.smartfarm.service.WeatherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
@Tag(name = "天气监测", description = "实时气象数据与天气预报")
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping("/stats")
    @Operation(summary = "天气统计概览")
    public ApiResponse<Map<String, Object>> getStats() {
        return ApiResponse.success(weatherService.getWeatherStats());
    }

    @GetMapping("/trend")
    @Operation(summary = "天气趋势数据（14天）")
    public ApiResponse<List<WeatherDTO>> getTrend() {
        return ApiResponse.success(weatherService.getWeatherTrend());
    }

    @GetMapping("/forecast")
    @Operation(summary = "7日天气预报")
    public ApiResponse<List<WeatherDTO>> getForecast() {
        return ApiResponse.success(weatherService.getWeatherForecast());
    }

    @PostMapping
    @Operation(summary = "添加天气记录（数据管道用）")
    public ApiResponse<WeatherDTO> addRecord(@RequestBody WeatherRecord record) {
        return ApiResponse.success(weatherService.addWeatherRecord(record));
    }
}
