package com.smartfarm.controller;

import com.smartfarm.dto.ApiResponse;
import com.smartfarm.dto.DeviceDTO;
import com.smartfarm.entity.Device;
import com.smartfarm.entity.MaintenanceRecord;
import com.smartfarm.service.DeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
@Tag(name = "设备监控", description = "IoT设备管理与远程控制")
public class DeviceController {

    private final DeviceService deviceService;

    @GetMapping("/stats")
    @Operation(summary = "设备统计概览")
    public ApiResponse<Map<String, Object>> getStats() {
        return ApiResponse.success(deviceService.getDeviceStats());
    }

    @GetMapping
    public ApiResponse<List<DeviceDTO>> getAll() {
        return ApiResponse.success(deviceService.getAllDevices());
    }

    @GetMapping("/{id}")
    public ApiResponse<DeviceDTO> getDevice(@PathVariable Long id) {
        return ApiResponse.success(deviceService.getDeviceById(id));
    }

    @PostMapping
    public ApiResponse<DeviceDTO> create(@RequestBody Device device) {
        return ApiResponse.success("设备添加成功", deviceService.createDevice(device));
    }

    @PutMapping("/{id}")
    public ApiResponse<DeviceDTO> update(@PathVariable Long id, @RequestBody Device device) {
        return ApiResponse.success(deviceService.updateDevice(id, device));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        deviceService.deleteDevice(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/{id}/maintenance")
    public ApiResponse<List<MaintenanceRecord>> getMaintenance(@PathVariable Long id) {
        return ApiResponse.success(deviceService.getMaintenanceByDevice(id));
    }

    @PostMapping("/maintenance")
    @Operation(summary = "创建维护记录")
    public ApiResponse<MaintenanceRecord> createMaintenance(@RequestBody MaintenanceRecord record) {
        return ApiResponse.success(deviceService.createMaintenance(record));
    }
}
