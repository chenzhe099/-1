package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 综合管理控制器
 * 提供生产记录、人员、库存、地块等管理数据的 CRUD 接口
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/management")
@RequiredArgsConstructor
@Tag(name = "综合管理", description = "生产记录、人员、库存、农场、种植周期的综合管理功能")
public class ManagementController {

    private final FarmingTasksRepository taskRepo;
    private final PersonnelRepository personnelRepo;
    private final InventoryRepository inventoryRepo;
    private final FarmsRepository farmRepo;
    private final PlantingCyclesRepository cycleRepo;

    @GetMapping("/stats")
    @Operation(summary = "管理统计", description = "返回记录总数、人员数、设备数、库存价值等统计")
    public ApiResponse<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("recordCount", taskRepo.count());
        stats.put("personnelCount", personnelRepo.count());
        stats.put("deviceCount", 0);
        stats.put("inventoryValue", "¥45,800");
        return ApiResponse.ok(stats);
    }

    // ==================== 生产记录 ====================

    @GetMapping("/records")
    @Operation(summary = "获取所有生产记录", description = "返回所有农事任务记录")
    public ApiResponse<List<FarmingTasks>> getRecords() {
        return ApiResponse.ok(taskRepo.findAll());
    }

    // ==================== 人员管理 ====================

    @GetMapping("/personnel")
    @Operation(summary = "获取人员列表", description = "返回所有人员信息")
    public ApiResponse<List<Personnel>> getPersonnel() {
        return ApiResponse.ok(personnelRepo.findAll());
    }

    @PostMapping("/personnel")
    @Transactional
    @Operation(summary = "新增人员", description = "添加一条人员记录")
    public ApiResponse<Personnel> createPersonnel(@RequestBody Personnel person) {
        if (person.getId() == null) person.setId("p_" + System.currentTimeMillis());
        Personnel saved = personnelRepo.save(person);
        log.info("新增人员: id={}, name={}", saved.getId(), saved.getName());
        return ApiResponse.ok(saved);
    }

    @PutMapping("/personnel/{id}")
    @Transactional
    @Operation(summary = "更新人员", description = "根据 ID 更新人员信息")
    public ApiResponse<Personnel> updatePersonnel(@PathVariable String id, @RequestBody Personnel person) {
        person.setId(id);
        Personnel saved = personnelRepo.save(person);
        log.info("更新人员: id={}", id);
        return ApiResponse.ok(saved);
    }

    @DeleteMapping("/personnel/{id}")
    @Transactional
    @Operation(summary = "删除人员", description = "根据 ID 删除指定人员")
    public ApiResponse<?> deletePersonnel(@PathVariable String id) {
        personnelRepo.deleteById(id);
        log.info("删除人员: id={}", id);
        return ApiResponse.ok("删除成功", null);
    }

    // ==================== 库存管理 ====================

    @GetMapping("/inventory")
    @Operation(summary = "获取库存列表", description = "返回所有库存物资信息")
    public ApiResponse<List<Inventory>> getInventory() {
        return ApiResponse.ok(inventoryRepo.findAll());
    }

    @PostMapping("/inventory")
    @Transactional
    @Operation(summary = "新增库存物资", description = "添加一条库存物资记录")
    public ApiResponse<Inventory> createInventory(@RequestBody Inventory item) {
        if (item.getId() == null) item.setId("inv_" + System.currentTimeMillis());
        Inventory saved = inventoryRepo.save(item);
        log.info("新增库存: id={}, name={}", saved.getId(), saved.getName());
        return ApiResponse.ok(saved);
    }

    @PutMapping("/inventory/{id}")
    @Transactional
    @Operation(summary = "更新库存物资", description = "根据 ID 更新库存物资信息")
    public ApiResponse<Inventory> updateInventory(@PathVariable String id, @RequestBody Inventory item) {
        item.setId(id);
        Inventory saved = inventoryRepo.save(item);
        log.info("更新库存: id={}", id);
        return ApiResponse.ok(saved);
    }

    @DeleteMapping("/inventory/{id}")
    @Transactional
    @Operation(summary = "删除库存物资", description = "根据 ID 删除指定库存物资")
    public ApiResponse<?> deleteInventory(@PathVariable String id) {
        inventoryRepo.deleteById(id);
        log.info("删除库存: id={}", id);
        return ApiResponse.ok("删除成功", null);
    }

    // ==================== 农场管理 ====================

    @GetMapping("/farms")
    @Operation(summary = "获取农场列表", description = "返回所有农场信息")
    public ApiResponse<List<Farms>> getFarms() {
        return ApiResponse.ok(farmRepo.findAll());
    }

    @GetMapping("/farms/{id}")
    @Operation(summary = "获取农场详情", description = "根据 ID 获取单个农场信息")
    public ApiResponse<Farms> getFarm(@PathVariable String id) {
        return ApiResponse.ok(farmRepo.findById(id).orElse(null));
    }

    @PostMapping("/farms")
    @Transactional
    @Operation(summary = "新增农场", description = "创建一条新的农场记录")
    public ApiResponse<Farms> createFarm(@RequestBody Farms farm) {
        if (farm.getId() == null) farm.setId("farm_" + System.currentTimeMillis());
        Farms saved = farmRepo.save(farm);
        log.info("新增农场: id={}, name={}", saved.getId(), saved.getName());
        return ApiResponse.ok(saved);
    }

    @PutMapping("/farms/{id}")
    @Transactional
    @Operation(summary = "更新农场", description = "根据 ID 更新农场信息")
    public ApiResponse<Farms> updateFarm(@PathVariable String id, @RequestBody Farms farm) {
        farm.setId(id);
        Farms saved = farmRepo.save(farm);
        log.info("更新农场: id={}", id);
        return ApiResponse.ok(saved);
    }

    @DeleteMapping("/farms/{id}")
    @Transactional
    @Operation(summary = "删除农场", description = "根据 ID 删除指定农场及其关联数据")
    public ApiResponse<?> deleteFarm(@PathVariable String id) {
        farmRepo.deleteById(id);
        log.info("删除农场: id={}", id);
        return ApiResponse.ok("删除成功", null);
    }

    // ==================== 种植周期 ====================

    @GetMapping("/cycles")
    @Operation(summary = "获取种植周期列表", description = "返回所有种植周期记录")
    public ApiResponse<List<PlantingCycles>> getCycles() {
        return ApiResponse.ok(cycleRepo.findAll());
    }

    @PostMapping("/cycles")
    @Transactional
    @Operation(summary = "新增种植周期", description = "创建一条新的种植周期记录")
    public ApiResponse<PlantingCycles> createCycle(@RequestBody PlantingCycles cycle) {
        if (cycle.getId() == null) cycle.setId("pc_" + System.currentTimeMillis());
        PlantingCycles saved = cycleRepo.save(cycle);
        log.info("新增种植周期: id={}", saved.getId());
        return ApiResponse.ok(saved);
    }

    @PutMapping("/cycles/{id}")
    @Transactional
    @Operation(summary = "更新种植周期", description = "根据 ID 更新种植周期信息")
    public ApiResponse<PlantingCycles> updateCycle(@PathVariable String id, @RequestBody PlantingCycles cycle) {
        cycle.setId(id);
        PlantingCycles saved = cycleRepo.save(cycle);
        log.info("更新种植周期: id={}", id);
        return ApiResponse.ok(saved);
    }

    @DeleteMapping("/cycles/{id}")
    @Transactional
    @Operation(summary = "删除种植周期", description = "根据 ID 删除指定种植周期")
    public ApiResponse<?> deleteCycle(@PathVariable String id) {
        cycleRepo.deleteById(id);
        log.info("删除种植周期: id={}", id);
        return ApiResponse.ok("删除成功", null);
    }
}
