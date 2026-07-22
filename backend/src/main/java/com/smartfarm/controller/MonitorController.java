package com.smartfarm.controller;

import com.smartfarm.dto.ApiResponse;
import com.smartfarm.dto.ModelVersionDTO;
import com.smartfarm.entity.ModelVersion;
import com.smartfarm.service.ModelMonitorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/monitor")
@RequiredArgsConstructor
@Tag(name = "模型监控", description = "AI模型性能、数据漂移与预测日志")
public class MonitorController {

    private final ModelMonitorService monitorService;

    @GetMapping("/stats")
    @Operation(summary = "模型监控统计")
    public ApiResponse<Map<String, Object>> getStats() {
        return ApiResponse.success(monitorService.getModelStats());
    }

    @GetMapping("/models")
    @Operation(summary = "获取所有模型版本")
    public ApiResponse<List<ModelVersionDTO>> getAllVersions() {
        return ApiResponse.success(monitorService.getAllVersions());
    }

    @GetMapping("/models/active")
    @Operation(summary = "获取活跃模型")
    public ApiResponse<List<ModelVersionDTO>> getActive() {
        return ApiResponse.success(monitorService.getActiveVersions());
    }

    @GetMapping("/models/{id}")
    @Operation(summary = "模型版本详情")
    public ApiResponse<ModelVersionDTO> getVersion(@PathVariable Long id) {
        return ApiResponse.success(monitorService.getVersionById(id));
    }

    @PostMapping("/models")
    @Operation(summary = "注册新模型版本")
    public ApiResponse<ModelVersionDTO> createVersion(@RequestBody ModelVersion mv) {
        return ApiResponse.success(monitorService.createVersion(mv));
    }
}
