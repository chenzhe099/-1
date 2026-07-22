package com.smartfarm.controller;

import com.smartfarm.dto.ApiResponse;
import com.smartfarm.entity.Alert;
import com.smartfarm.entity.OperationLog;
import com.smartfarm.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@Tag(name = "预警管理", description = "系统预警与操作日志")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @Operation(summary = "获取活跃预警")
    public ApiResponse<List<Alert>> getActiveAlerts() {
        return ApiResponse.success(alertService.getActiveAlerts());
    }

    @GetMapping("/all")
    @Operation(summary = "获取全部预警")
    public ApiResponse<List<Alert>> getAllAlerts() {
        return ApiResponse.success(alertService.getAllAlerts());
    }

    @GetMapping("/count")
    @Operation(summary = "未处理预警数量")
    public ApiResponse<Long> getCount() {
        return ApiResponse.success(alertService.getUnresolvedCount());
    }

    @PostMapping
    public ApiResponse<Alert> create(@RequestBody Alert alert) {
        return ApiResponse.success(alertService.createAlert(alert));
    }

    @PutMapping("/{id}/resolve")
    @Operation(summary = "处理预警")
    public ApiResponse<Alert> resolve(@PathVariable Long id) {
        return ApiResponse.success("预警已处理", alertService.resolveAlert(id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        alertService.deleteAlert(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/logs")
    @Operation(summary = "获取操作日志")
    public ApiResponse<List<OperationLog>> getLogs() {
        return ApiResponse.success(alertService.getOperationLogs());
    }

    @PostMapping("/logs")
    public ApiResponse<OperationLog> addLog(@RequestBody OperationLog log) {
        return ApiResponse.success(alertService.addOperationLog(log));
    }
}
