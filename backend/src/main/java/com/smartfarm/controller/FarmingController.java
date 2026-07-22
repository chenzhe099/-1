package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import com.smartfarm.service.AiClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/farming")
@RequiredArgsConstructor
public class FarmingController {

    private final IrrigationPlansRepository irrigationRepo;
    private final FertilizationPlansRepository fertilizationRepo;
    private final FarmingTasksRepository taskRepo;
    private final FieldsRepository fieldRepo;
    private final AiClientService aiClient;

    @GetMapping("/irrigation")
    public ApiResponse<List<IrrigationPlans>> getIrrigation() {
        return ApiResponse.ok(irrigationRepo.findAll());
    }

    @GetMapping("/fertilization")
    public ApiResponse<List<FertilizationPlans>> getFertilization() {
        return ApiResponse.ok(fertilizationRepo.findAll());
    }

    @GetMapping("/fields")
    public ApiResponse<List<Fields>> getFields() {
        return ApiResponse.ok(fieldRepo.findAll());
    }

    @GetMapping("/tasks")
    public ApiResponse<List<FarmingTasks>> getTasks() {
        return ApiResponse.ok(taskRepo.findAll());
    }

    @PostMapping("/tasks")
    public ApiResponse<FarmingTasks> createTask(@RequestBody FarmingTasks task) {
        if (task.getId() == null) task.setId("task_" + System.currentTimeMillis());
        return ApiResponse.ok(taskRepo.save(task));
    }

    @PutMapping("/tasks/{id}")
    public ApiResponse<FarmingTasks> updateTask(@PathVariable String id, @RequestBody FarmingTasks task) {
        task.setId(id);
        return ApiResponse.ok(taskRepo.save(task));
    }

    @DeleteMapping("/tasks/{id}")
    public ApiResponse<?> deleteTask(@PathVariable String id) {
        taskRepo.deleteById(id);
        return ApiResponse.ok("删除成功", null);
    }

    @PostMapping("/irrigation/{id}/execute")
    public ApiResponse<?> executeIrrigation(@PathVariable String id) {
        irrigationRepo.findById(id).ifPresent(p -> {
            p.setStatus("executing");
            irrigationRepo.save(p);
        });
        return ApiResponse.ok("灌溉已启动", null);
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("irrigationTotal", irrigationRepo.findAll().stream()
                .mapToDouble(p -> p.getWaterVolume() != null ? p.getWaterVolume() : 0).sum());
        stats.put("fertilizationCount", fertilizationRepo.count());
        return ApiResponse.ok(stats);
    }
}
