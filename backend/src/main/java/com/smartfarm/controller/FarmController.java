package com.smartfarm.controller;

import com.smartfarm.dto.*;
import com.smartfarm.entity.Farm;
import com.smartfarm.entity.Field;
import com.smartfarm.entity.PlantingCycle;
import com.smartfarm.service.FarmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farms")
@RequiredArgsConstructor
@Tag(name = "农场与地块管理", description = "农场、地块、种植周期CRUD")
public class FarmController {

    private final FarmService farmService;

    // ---- 农场 ----
    @GetMapping
    @Operation(summary = "获取所有农场")
    public ApiResponse<List<FarmDTO>> getAllFarms() {
        return ApiResponse.success(farmService.getAllFarms());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取农场详情")
    public ApiResponse<FarmDTO> getFarm(@PathVariable Long id) {
        return ApiResponse.success(farmService.getFarmById(id));
    }

    @PostMapping
    @Operation(summary = "创建农场")
    public ApiResponse<FarmDTO> createFarm(@RequestBody Farm farm) {
        return ApiResponse.success("农场创建成功", farmService.createFarm(farm));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新农场")
    public ApiResponse<FarmDTO> updateFarm(@PathVariable Long id, @RequestBody Farm farm) {
        return ApiResponse.success("农场更新成功", farmService.updateFarm(id, farm));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除农场")
    public ApiResponse<Void> deleteFarm(@PathVariable Long id) {
        farmService.deleteFarm(id);
        return ApiResponse.success("农场已删除", null);
    }

    // ---- 地块 ----
    @GetMapping("/{farmId}/fields")
    @Operation(summary = "获取农场地块列表")
    public ApiResponse<List<FieldDTO>> getFields(@PathVariable Long farmId) {
        return ApiResponse.success(farmService.getFieldsByFarm(farmId));
    }

    @PostMapping("/fields")
    @Operation(summary = "创建地块")
    public ApiResponse<FieldDTO> createField(@RequestBody Field field) {
        return ApiResponse.success("地块创建成功", farmService.createField(field));
    }

    @PutMapping("/fields/{id}")
    @Operation(summary = "更新地块")
    public ApiResponse<FieldDTO> updateField(@PathVariable Long id, @RequestBody Field field) {
        return ApiResponse.success("地块更新成功", farmService.updateField(id, field));
    }

    @DeleteMapping("/fields/{id}")
    @Operation(summary = "删除地块")
    public ApiResponse<Void> deleteField(@PathVariable Long id) {
        farmService.deleteField(id);
        return ApiResponse.success("地块已删除", null);
    }

    // ---- 种植周期 ----
    @GetMapping("/{farmId}/cycles")
    @Operation(summary = "获取种植周期")
    public ApiResponse<List<PlantingCycleDTO>> getCycles(@PathVariable Long farmId) {
        return ApiResponse.success(farmService.getCyclesByFarm(farmId));
    }

    @GetMapping("/cycles/active")
    @Operation(summary = "获取活跃种植周期")
    public ApiResponse<List<PlantingCycleDTO>> getActiveCycles() {
        return ApiResponse.success(farmService.getActiveCycles());
    }

    @PostMapping("/cycles")
    @Operation(summary = "创建种植周期")
    public ApiResponse<PlantingCycleDTO> createCycle(@RequestBody PlantingCycle cycle) {
        return ApiResponse.success("种植周期创建成功", farmService.createCycle(cycle));
    }
}
