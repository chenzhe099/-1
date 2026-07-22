package com.smartfarm.service;

import com.smartfarm.dto.FarmingTaskDTO;
import com.smartfarm.entity.FarmingTask;
import com.smartfarm.exception.ResourceNotFoundException;
import com.smartfarm.repository.FarmingTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmingTaskService {

    private final FarmingTaskRepository taskRepo;

    public List<FarmingTaskDTO> getAllTasks() {
        return taskRepo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<FarmingTaskDTO> getTasksByStatus(String status) {
        return taskRepo.findByStatus(status).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<FarmingTaskDTO> getTasksByField(Long fieldId) {
        return taskRepo.findByFieldId(fieldId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public FarmingTaskDTO getTaskById(Long id) {
        FarmingTask t = taskRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("农事任务", id));
        return toDTO(t);
    }

    public FarmingTaskDTO createTask(FarmingTask task) {
        if (task.getStatus() == null) task.setStatus("pending");
        taskRepo.save(task);
        return toDTO(task);
    }

    public FarmingTaskDTO updateTask(Long id, FarmingTask updated) {
        FarmingTask t = taskRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("农事任务", id));
        if (updated.getStatus() != null) t.setStatus(updated.getStatus());
        if (updated.getNotes() != null) t.setNotes(updated.getNotes());
        if (updated.getAssignedTo() != null) t.setAssignedTo(updated.getAssignedTo());
        if (updated.getPriority() != null) t.setPriority(updated.getPriority());
        if ("completed".equals(updated.getStatus())) {
            t.setCompletedAt(java.time.LocalDateTime.now());
        }
        taskRepo.save(t);
        return toDTO(t);
    }

    public void deleteTask(Long id) {
        taskRepo.deleteById(id);
    }

    private FarmingTaskDTO toDTO(FarmingTask t) {
        return FarmingTaskDTO.builder()
                .id(t.getId()).type(t.getType()).fieldId(t.getFieldId())
                .fieldCode(t.getFieldCode()).cropName(t.getCropName())
                .scheduledTime(t.getScheduledTime()).estimatedDuration(t.getEstimatedDuration())
                .status(t.getStatus()).assignedTo(t.getAssignedTo())
                .priority(t.getPriority()).notes(t.getNotes()).build();
    }
}
