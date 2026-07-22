package com.smartfarm.controller;

import com.smartfarm.dto.ApiResponse;
import com.smartfarm.dto.FarmingTaskDTO;
import com.smartfarm.entity.FarmingTask;
import com.smartfarm.service.FarmingTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "农事任务", description = "农事任务生成、提醒和完成管理")
public class FarmingTaskController {

    private final FarmingTaskService taskService;

    @GetMapping
    public ApiResponse<List<FarmingTaskDTO>> getAll(@RequestParam(required = false) String status) {
        if (status != null) return ApiResponse.success(taskService.getTasksByStatus(status));
        return ApiResponse.success(taskService.getAllTasks());
    }

    @GetMapping("/{id}")
    public ApiResponse<FarmingTaskDTO> getTask(@PathVariable Long id) {
        return ApiResponse.success(taskService.getTaskById(id));
    }

    @PostMapping
    @Operation(summary = "创建农事任务")
    public ApiResponse<FarmingTaskDTO> create(@RequestBody FarmingTask task) {
        return ApiResponse.success("任务创建成功", taskService.createTask(task));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新农事任务")
    public ApiResponse<FarmingTaskDTO> update(@PathVariable Long id, @RequestBody FarmingTask task) {
        return ApiResponse.success("任务更新成功", taskService.updateTask(id, task));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ApiResponse.success("任务已删除", null);
    }
}
