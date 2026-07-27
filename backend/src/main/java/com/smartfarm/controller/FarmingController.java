package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import com.smartfarm.service.AiClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 农事管理控制器
 * 提供灌溉方案、施肥方案、地块管理、农事任务的 CRUD 及 AI 智能决策功能
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/farming")
@RequiredArgsConstructor
@Tag(name = "农事管理", description = "灌溉/施肥方案、地块管理、农事任务及 AI 智能决策")
public class FarmingController {

    private final IrrigationPlansRepository irrigationRepo;
    private final FertilizationPlansRepository fertilizationRepo;
    private final FarmingTasksRepository taskRepo;
    private final FieldsRepository fieldRepo;
    private final AiClientService aiClient;

    // ==================== 灌溉方案 CRUD ====================

    @GetMapping("/irrigation")
    @Operation(summary = "获取灌溉方案列表", description = "返回所有灌溉方案")
    public ApiResponse<List<IrrigationPlans>> getIrrigation() {
        return ApiResponse.ok(irrigationRepo.findAll());
    }

    @PostMapping("/irrigation")
    @Transactional
    @Operation(summary = "新增灌溉方案", description = "创建一条新的灌溉方案记录")
    public ApiResponse<IrrigationPlans> createIrrigation(@RequestBody IrrigationPlans plan) {
        if (plan.getId() == null) plan.setId("irr_" + System.currentTimeMillis());
        IrrigationPlans saved = irrigationRepo.save(plan);
        log.info("新增灌溉方案: id={}", saved.getId());
        return ApiResponse.ok(saved);
    }

    @PutMapping("/irrigation/{id}")
    @Transactional
    @Operation(summary = "更新灌溉方案", description = "根据 ID 更新灌溉方案信息")
    public ApiResponse<IrrigationPlans> updateIrrigation(@PathVariable String id, @RequestBody IrrigationPlans plan) {
        plan.setId(id);
        IrrigationPlans saved = irrigationRepo.save(plan);
        log.info("更新灌溉方案: id={}", id);
        return ApiResponse.ok(saved);
    }

    @DeleteMapping("/irrigation/{id}")
    @Transactional
    @Operation(summary = "删除灌溉方案", description = "根据 ID 删除指定灌溉方案")
    public ApiResponse<?> deleteIrrigation(@PathVariable String id) {
        irrigationRepo.deleteById(id);
        log.info("删除灌溉方案: id={}", id);
        return ApiResponse.ok("删除成功", null);
    }

    @PostMapping("/irrigation/{id}/execute")
    @Transactional
    @Operation(summary = "执行灌溉方案", description = "将指定灌溉方案的状态更新为执行中")
    public ApiResponse<?> executeIrrigation(@PathVariable String id) {
        irrigationRepo.findById(id).ifPresent(p -> {
            p.setStatus("executing");
            irrigationRepo.save(p);
            log.info("灌溉方案执行中: id={}", id);
        });
        return ApiResponse.ok("灌溉已启动", null);
    }

    // ==================== 施肥方案 CRUD ====================

    @GetMapping("/fertilization")
    @Operation(summary = "获取施肥方案列表", description = "返回所有施肥方案")
    public ApiResponse<List<FertilizationPlans>> getFertilization() {
        return ApiResponse.ok(fertilizationRepo.findAll());
    }

    @PostMapping("/fertilization")
    @Transactional
    @Operation(summary = "新增施肥方案", description = "创建一条新的施肥方案记录")
    public ApiResponse<FertilizationPlans> createFertilization(@RequestBody FertilizationPlans plan) {
        if (plan.getId() == null) plan.setId("fert_" + System.currentTimeMillis());
        FertilizationPlans saved = fertilizationRepo.save(plan);
        log.info("新增施肥方案: id={}", saved.getId());
        return ApiResponse.ok(saved);
    }

    @PutMapping("/fertilization/{id}")
    @Transactional
    @Operation(summary = "更新施肥方案", description = "根据 ID 更新施肥方案信息")
    public ApiResponse<FertilizationPlans> updateFertilization(@PathVariable String id, @RequestBody FertilizationPlans plan) {
        plan.setId(id);
        FertilizationPlans saved = fertilizationRepo.save(plan);
        log.info("更新施肥方案: id={}", id);
        return ApiResponse.ok(saved);
    }

    @DeleteMapping("/fertilization/{id}")
    @Transactional
    @Operation(summary = "删除施肥方案", description = "根据 ID 删除指定施肥方案")
    public ApiResponse<?> deleteFertilization(@PathVariable String id) {
        fertilizationRepo.deleteById(id);
        log.info("删除施肥方案: id={}", id);
        return ApiResponse.ok("删除成功", null);
    }

    // ==================== 地块管理 CRUD ====================

    @GetMapping("/fields")
    @Operation(summary = "获取地块列表", description = "返回所有地块信息")
    public ApiResponse<List<Fields>> getFields() {
        return ApiResponse.ok(fieldRepo.findAll());
    }

    @PostMapping("/fields")
    @Transactional
    @Operation(summary = "新增地块", description = "创建一条新的地块记录")
    public ApiResponse<Fields> createField(@RequestBody Fields field) {
        if (field.getId() == null) field.setId("f_" + System.currentTimeMillis());
        Fields saved = fieldRepo.save(field);
        log.info("新增地块: id={}, name={}", saved.getId(), saved.getName());
        return ApiResponse.ok(saved);
    }

    @PutMapping("/fields/{id}")
    @Transactional
    @Operation(summary = "更新地块", description = "根据 ID 更新地块信息")
    public ApiResponse<Fields> updateField(@PathVariable String id, @RequestBody Fields field) {
        field.setId(id);
        Fields saved = fieldRepo.save(field);
        log.info("更新地块: id={}", id);
        return ApiResponse.ok(saved);
    }

    @DeleteMapping("/fields/{id}")
    @Transactional
    @Operation(summary = "删除地块", description = "根据 ID 删除指定地块")
    public ApiResponse<?> deleteField(@PathVariable String id) {
        fieldRepo.deleteById(id);
        log.info("删除地块: id={}", id);
        return ApiResponse.ok("删除成功", null);
    }

    // ==================== 农事任务 CRUD ====================

    @GetMapping("/tasks")
    @Operation(summary = "获取农事任务列表", description = "返回所有农事任务")
    public ApiResponse<List<FarmingTasks>> getTasks() {
        return ApiResponse.ok(taskRepo.findAll());
    }

    @PostMapping("/tasks")
    @Transactional
    @Operation(summary = "新增农事任务", description = "创建一条新的农事任务记录")
    public ApiResponse<FarmingTasks> createTask(@RequestBody FarmingTasks task) {
        if (task.getId() == null) task.setId("task_" + System.currentTimeMillis());
        FarmingTasks saved = taskRepo.save(task);
        log.info("新增农事任务: id={}", saved.getId());
        return ApiResponse.ok(saved);
    }

    @PutMapping("/tasks/{id}")
    @Transactional
    @Operation(summary = "更新农事任务", description = "根据 ID 更新农事任务信息")
    public ApiResponse<FarmingTasks> updateTask(@PathVariable String id, @RequestBody FarmingTasks task) {
        task.setId(id);
        FarmingTasks saved = taskRepo.save(task);
        log.info("更新农事任务: id={}", id);
        return ApiResponse.ok(saved);
    }

    @DeleteMapping("/tasks/{id}")
    @Transactional
    @Operation(summary = "删除农事任务", description = "根据 ID 删除指定农事任务")
    public ApiResponse<?> deleteTask(@PathVariable String id) {
        taskRepo.deleteById(id);
        log.info("删除农事任务: id={}", id);
        return ApiResponse.ok("删除成功", null);
    }

    // ==================== 统计 ====================

    @GetMapping("/stats")
    @Operation(summary = "农事统计", description = "返回灌溉总量和施肥方案数量等统计信息")
    public ApiResponse<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("irrigationTotal", irrigationRepo.findAll().stream()
                .mapToDouble(p -> p.getWaterVolume() != null ? p.getWaterVolume() : 0).sum());
        stats.put("fertilizationCount", fertilizationRepo.count());
        return ApiResponse.ok(stats);
    }

    // ==================== AI 智能灌溉 ====================

    @PostMapping("/irrigation/ai-plan")
    @Operation(summary = "AI 灌溉决策", description = "调用 AI 模型生成智能灌溉方案")
    public ApiResponse<?> aiIrrigationPlan(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = aiClient.irrigationPlan(params);
        return ApiResponse.ok(result);
    }

    // ==================== AI 智能施肥 ====================

    @PostMapping("/fertilization/ai-plan")
    @Operation(summary = "AI 施肥决策", description = "调用 AI 模型生成智能施肥方案")
    public ApiResponse<?> aiFertilizationPlan(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = aiClient.fertilizationPlan(params);
        return ApiResponse.ok(result);
    }

    // ==================== AI Agent 农事决策 ====================

    @PostMapping("/agent/decision")
    @Operation(summary = "AI Agent 农事决策", description = "调用 AI Agent 综合天气/土壤/病虫害/市场给出农事建议")
    public ApiResponse<?> agentDecision(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = aiClient.agentDecision(params);
        return ApiResponse.ok(result);
    }
}
