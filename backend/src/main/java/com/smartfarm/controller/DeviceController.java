package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 设备管理控制器
 * 提供设备列表、状态统计、设备维护等管理功能
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
@Tag(name = "设备管理", description = "农业设备的增删改查、状态监控与维护记录管理")
public class DeviceController {

    private final DevicesRepository deviceRepo;
    private final MaintenanceRecordsRepository maintenanceRepo;

    @GetMapping("/summary")
    @Operation(summary = "设备状态统计", description = "返回设备总数、在线数、故障数、维护中数量")
    public ApiResponse<Map<String, Object>> getSummary() {
        Map<String, Object> s = new HashMap<>();
        s.put("total", deviceRepo.count());
        s.put("online", deviceRepo.findByStatus("online").size());
        s.put("fault", deviceRepo.findByStatus("fault").size());
        s.put("maintenance", deviceRepo.findByStatus("maintenance").size());
        return ApiResponse.ok(s);
    }

    @GetMapping
    @Operation(summary = "获取所有设备", description = "返回全部设备列表")
    public ApiResponse<List<Devices>> getDevices() {
        return ApiResponse.ok(deviceRepo.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取设备详情", description = "根据设备ID获取单个设备的详细信息")
    public ApiResponse<Devices> getDevice(@PathVariable String id) {
        return ApiResponse.ok(deviceRepo.findById(id).orElse(null));
    }

    @PostMapping
    @Transactional
    @Operation(summary = "新增设备", description = "添加一条新的设备记录")
    public ApiResponse<Devices> createDevice(@RequestBody Devices device) {
        if (device.getId() == null) device.setId("dev_" + System.currentTimeMillis());
        Devices saved = deviceRepo.save(device);
        log.info("新增设备: id={}, name={}", saved.getId(), saved.getName());
        return ApiResponse.ok(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    @Operation(summary = "更新设备", description = "根据设备ID更新设备信息")
    public ApiResponse<Devices> updateDevice(@PathVariable String id, @RequestBody Devices device) {
        device.setId(id);
        Devices saved = deviceRepo.save(device);
        log.info("更新设备: id={}", id);
        return ApiResponse.ok(saved);
    }

    @DeleteMapping("/{id}")
    @Transactional
    @Operation(summary = "删除设备", description = "根据设备ID删除指定设备")
    public ApiResponse<?> deleteDevice(@PathVariable String id) {
        deviceRepo.deleteById(id);
        log.info("删除设备: id={}", id);
        return ApiResponse.ok("删除成功", null);
    }

    @GetMapping("/maintenance")
    @Operation(summary = "获取所有维护记录", description = "返回全部设备维护记录列表")
    public ApiResponse<List<MaintenanceRecords>> getMaintenance() {
        return ApiResponse.ok(maintenanceRepo.findAll());
    }

    @PostMapping("/maintenance")
    @Transactional
    @Operation(summary = "新增维护记录", description = "添加一条设备维护记录，未传 id 则自动生成")
    public ApiResponse<MaintenanceRecords> createMaintenance(@RequestBody MaintenanceRecords record) {
        if (record.getId() == null) record.setId("mr_" + System.currentTimeMillis());
        MaintenanceRecords saved = maintenanceRepo.save(record);
        log.info("新增维护记录: id={}", saved.getId());
        return ApiResponse.ok(saved);
    }

    @PutMapping("/maintenance/{id}")
    @Transactional
    @Operation(summary = "更新维护记录", description = "根据维护记录ID更新记录信息")
    public ApiResponse<MaintenanceRecords> updateMaintenance(@PathVariable String id, @RequestBody MaintenanceRecords record) {
        record.setId(id);
        MaintenanceRecords saved = maintenanceRepo.save(record);
        log.info("更新维护记录: id={}", id);
        return ApiResponse.ok(saved);
    }

    @DeleteMapping("/maintenance/{id}")
    @Transactional
    @Operation(summary = "删除维护记录", description = "根据维护记录ID删除指定记录")
    public ApiResponse<?> deleteMaintenance(@PathVariable String id) {
        maintenanceRepo.deleteById(id);
        log.info("删除维护记录: id={}", id);
        return ApiResponse.ok("删除成功", null);
    }
}
