package com.smartfarm.service;

import com.smartfarm.entity.EnvironmentReadings;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FarmingTasksRepository taskRepo;
    private final DevicesRepository deviceRepo;
    private final AlertsRepository alertRepo;
    private final YieldPredictionsRepository yieldRepo;
    private final FieldsRepository fieldRepo;
    private final EnvironmentReadingsRepository envRepo;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalTasks = taskRepo.count();
        long pendingTasks = taskRepo.findByStatus("pending").size();
        stats.put("tasksToday", pendingTasks);
        stats.put("tasksChange", "+12%");
        stats.put("tasksTotal", totalTasks);

        long totalDevices = deviceRepo.count();
        long onlineDevices = deviceRepo.findByStatus("online").size();
        int onlineRate = totalDevices > 0 ? (int) (onlineDevices * 100 / totalDevices) : 0;
        stats.put("deviceOnlineRate", onlineRate);
        stats.put("deviceChange", "+2%");

        long alertCount = alertRepo.findByIsResolved(false).size();
        stats.put("alertCount", alertCount);
        stats.put("alertDesc", alertCount > 0 ? "需处理" : "无预警");

        double totalYield = yieldRepo.findAll().stream()
                .filter(y -> y.getPredicted() != null)
                .filter(y -> y.getPredicted() != null)
                .mapToDouble(y -> y.getPredicted())
                .sum();
        stats.put("monthlyYield", String.format("%.1f", totalYield));
        stats.put("yieldUnit", "吨");
        stats.put("yieldChange", "+8%");

        return stats;
    }

    public List<Map<String, Object>> getFieldStatusList() {
        return fieldRepo.findAll().stream().map(f -> {
            Map<String, Object> m = new HashMap<>();
            m.put("code", f.getCode());
            m.put("cropName", f.getCropName());
            m.put("status", f.getStatus());
            return m;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTodayTasks() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return taskRepo.findAll().stream()
                .filter(t -> t.getScheduledTime() != null && t.getScheduledTime().startsWith(today))
                .map(t -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", t.getId());
                    m.put("type", t.getType());
                    m.put("fieldCode", t.getFieldCode());
                    m.put("cropName", t.getCropName());
                    m.put("scheduledTime", t.getScheduledTime());
                    m.put("status", t.getStatus());
                    m.put("assignedTo", t.getAssignedTo());
                    m.put("priority", t.getPriority());
                    return m;
                }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAlertList() {
        return alertRepo.findByIsResolved(false).stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("title", a.getTitle());
            m.put("message", a.getMessage());
            m.put("severity", a.getSeverity());
            m.put("isRead", a.getIsRead());
            m.put("isResolved", a.getIsResolved());
            m.put("createdAt", a.getCreatedAt());
            return m;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getEnvironmentTrend() {
        List<EnvironmentReadings> readings = envRepo.findAll();
        Map<String, Object> trend = new HashMap<>();
        trend.put("labels", readings.stream().map(r -> {
            String ts = r.getTimestamp();
            return ts != null && ts.length() >= 16 ? ts.substring(11, 16) : ts;
        }).collect(Collectors.toList()));
        trend.put("temperature", readings.stream().map(EnvironmentReadings::getTemperature).collect(Collectors.toList()));
        trend.put("humidity", readings.stream().map(EnvironmentReadings::getHumidity).collect(Collectors.toList()));
        return trend;
    }
}
