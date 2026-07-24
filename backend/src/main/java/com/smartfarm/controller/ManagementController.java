package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/management")
@RequiredArgsConstructor
public class ManagementController {

    private final FarmingTasksRepository taskRepo;
    private final PersonnelRepository personnelRepo;
    private final InventoryRepository inventoryRepo;
    private final FarmsRepository farmRepo;
    private final PlantingCyclesRepository cycleRepo;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("recordCount", taskRepo.count());
        stats.put("personnelCount", personnelRepo.count());
        stats.put("deviceCount", 0);
        stats.put("inventoryValue", "¥45,800");
        return ApiResponse.ok(stats);
    }

    @GetMapping("/records")
    public ApiResponse<List<FarmingTasks>> getRecords() {
        return ApiResponse.ok(taskRepo.findAll());
    }

    @GetMapping("/personnel")
    public ApiResponse<List<Personnel>> getPersonnel() {
        return ApiResponse.ok(personnelRepo.findAll());
    }

    @GetMapping("/inventory")
    public ApiResponse<List<Inventory>> getInventory() {
        return ApiResponse.ok(inventoryRepo.findAll());
    }

    @GetMapping("/farms")
    public ApiResponse<List<Farms>> getFarms() {
        return ApiResponse.ok(farmRepo.findAll());
    }

    @GetMapping("/farms/{id}")
    public ApiResponse<Farms> getFarm(@PathVariable String id) {
        return ApiResponse.ok(farmRepo.findById(id).orElse(null));
    }

    @GetMapping("/cycles")
    public ApiResponse<List<PlantingCycles>> getCycles() {
        return ApiResponse.ok(cycleRepo.findAll());
    }
}
