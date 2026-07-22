package com.smartfarm.controller;

import com.smartfarm.dto.*;
import com.smartfarm.entity.Alert;
import com.smartfarm.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "数据总览", description = "仪表盘统计数据接口")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "获取仪表盘统计数据")
    public ApiResponse<DashboardStatsDTO> getStats() {
        return ApiResponse.success(dashboardService.getStats());
    }

    @GetMapping("/fields")
    @Operation(summary = "获取地块状态列表")
    public ApiResponse<List<FieldDTO>> getFieldStatuses() {
        return ApiResponse.success(dashboardService.getFieldStatuses());
    }

    @GetMapping("/tasks/today")
    @Operation(summary = "获取今日农事任务")
    public ApiResponse<List<FarmingTaskDTO>> getTodayTasks() {
        return ApiResponse.success(dashboardService.getTodayTasks());
    }

    @GetMapping("/alerts")
    @Operation(summary = "获取活跃预警列表")
    public ApiResponse<List<Alert>> getActiveAlerts() {
        return ApiResponse.success(dashboardService.getActiveAlerts());
    }
}
