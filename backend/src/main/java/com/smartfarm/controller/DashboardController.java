package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ApiResponse<?> getStats() {
        return ApiResponse.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/fields")
    public ApiResponse<?> getFields() {
        return ApiResponse.ok(dashboardService.getFieldStatusList());
    }

    @GetMapping("/tasks/today")
    public ApiResponse<?> getTodayTasks() {
        return ApiResponse.ok(dashboardService.getTodayTasks());
    }

    @GetMapping("/alerts")
    public ApiResponse<?> getAlerts() {
        return ApiResponse.ok(dashboardService.getAlertList());
    }

    @GetMapping("/environment")
    public ApiResponse<?> getEnvironment() {
        return ApiResponse.ok(dashboardService.getEnvironmentTrend());
    }
}
