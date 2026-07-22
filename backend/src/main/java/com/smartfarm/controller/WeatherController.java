package com.smartfarm.controller;

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
