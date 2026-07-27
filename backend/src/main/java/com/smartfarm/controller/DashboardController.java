package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 仪表盘控制器
 * 提供首页仪表盘所需的数据统计、地块状态、今日任务、预警和环境趋势
 */
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "仪表盘", description = "首页仪表盘数据统计、地块状态、今日任务、预警信息与环境趋势")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "获取仪表盘统计", description = "返回地块数、设备数、人员数、进行中任务数等统计")
    public ApiResponse<?> getStats() {
        return ApiResponse.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/fields")
    @Operation(summary = "获取地块状态", description = "返回各地块的种植状态列表")
    public ApiResponse<?> getFields() {
        return ApiResponse.ok(dashboardService.getFieldStatusList());
    }

    @GetMapping("/tasks/today")
    @Operation(summary = "获取今日任务", description = "返回今日农事任务列表")
    public ApiResponse<?> getTodayTasks() {
        return ApiResponse.ok(dashboardService.getTodayTasks());
    }

    @GetMapping("/alerts")
    @Operation(summary = "获取预警信息", description = "返回未解决的预警列表")
    public ApiResponse<?> getAlerts() {
        return ApiResponse.ok(dashboardService.getAlertList());
    }

    @GetMapping("/environment")
    @Operation(summary = "获取环境趋势", description = "返回环境监测数据的趋势分析")
    public ApiResponse<?> getEnvironment() {
        return ApiResponse.ok(dashboardService.getEnvironmentTrend());
    }
}
