package com.smartfarm.service;

import com.smartfarm.dto.*;
import com.smartfarm.entity.*;
import com.smartfarm.exception.ResourceNotFoundException;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FarmingTaskRepository taskRepo;
    private final DeviceRepository deviceRepo;
    private final AlertRepository alertRepo;
    private final FieldRepository fieldRepo;
    private final YieldPredictionRepository yieldRepo;
    private final WeatherRecordRepository weatherRepo;
    private final MarketPriceRepository marketRepo;
    private final PestKnowledgeRepository pestRepo;

    public DashboardStatsDTO getStats() {
        long totalDevices = deviceRepo.count();
        long onlineDevices = deviceRepo.countByStatus("online");
        int onlineRate = totalDevices > 0 ? (int) ((onlineDevices * 100) / totalDevices) : 0;

        return DashboardStatsDTO.builder()
                .tasksToday(taskRepo.count())
                .tasksChange("+12%")
                .deviceOnlineRate(onlineRate)
                .deviceChange("+2%")
                .alertCount(alertRepo.countByIsResolvedFalse())
                .monthlyYield(128.5)
                .yieldChange("+8%")
                .yieldUnit("吨")
                .build();
    }

    public List<FieldDTO> getFieldStatuses() {
        return fieldRepo.findAll().stream().map(f -> FieldDTO.builder()
                .id(f.getId()).farmId(f.getFarmId()).code(f.getCode())
                .name(f.getName()).cropName(f.getCropName()).area(f.getArea())
                .status(f.getStatus()).soilMoisture(f.getSoilMoisture())
                .soilPh(f.getSoilPh()).plantedDate(f.getPlantedDate())
                .expectedHarvest(f.getExpectedHarvest()).build()
        ).collect(Collectors.toList());
    }

    public List<FarmingTaskDTO> getTodayTasks() {
        LocalDate today = LocalDate.now();
        return taskRepo.findByScheduledTimeBetween(
                today.atStartOfDay(), today.plusDays(1).atStartOfDay()
        ).stream().map(this::toTaskDTO).collect(Collectors.toList());
    }

    public List<Alert> getActiveAlerts() {
        return alertRepo.findByIsResolvedFalseOrderByCreatedAtDesc();
    }

    private FarmingTaskDTO toTaskDTO(FarmingTask t) {
        return FarmingTaskDTO.builder()
                .id(t.getId()).type(t.getType()).fieldId(t.getFieldId())
                .fieldCode(t.getFieldCode()).cropName(t.getCropName())
                .scheduledTime(t.getScheduledTime()).estimatedDuration(t.getEstimatedDuration())
                .status(t.getStatus()).assignedTo(t.getAssignedTo())
                .priority(t.getPriority()).notes(t.getNotes()).build();
    }
}
