package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DevicesRepository deviceRepo;
    private final MaintenanceRecordsRepository maintenanceRepo;

    @GetMapping("/summary")
    public ApiResponse<Map<String, Object>> getSummary() {
        Map<String, Object> s = new HashMap<>();
        s.put("total", deviceRepo.count());
        s.put("online", deviceRepo.findByStatus("online").size());
        s.put("fault", deviceRepo.findByStatus("fault").size());
        s.put("maintenance", deviceRepo.findByStatus("maintenance").size());
        return ApiResponse.ok(s);
    }

    @GetMapping
    public ApiResponse<List<Devices>> getDevices() {
        return ApiResponse.ok(deviceRepo.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Devices> getDevice(@PathVariable String id) {
        return ApiResponse.ok(deviceRepo.findById(id).orElse(null));
    }

    @PutMapping("/{id}")
    public ApiResponse<Devices> updateDevice(@PathVariable String id, @RequestBody Devices device) {
        device.setId(id);
        return ApiResponse.ok(deviceRepo.save(device));
    }

    @GetMapping("/maintenance")
    public ApiResponse<List<MaintenanceRecords>> getMaintenance() {
        return ApiResponse.ok(maintenanceRepo.findAll());
    }

    @PostMapping("/maintenance")
    public ApiResponse<MaintenanceRecords> createMaintenance(@RequestBody MaintenanceRecords record) {
        if (record.getId() == null) record.setId("mr_" + System.currentTimeMillis());
        return ApiResponse.ok(maintenanceRepo.save(record));
    }
}
