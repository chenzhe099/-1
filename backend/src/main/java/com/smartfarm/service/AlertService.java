package com.smartfarm.service;

import com.smartfarm.entity.Alert;
import com.smartfarm.entity.OperationLog;
import com.smartfarm.exception.ResourceNotFoundException;
import com.smartfarm.repository.AlertRepository;
import com.smartfarm.repository.OperationLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepo;
    private final OperationLogRepository logRepo;

    public long getUnresolvedCount() {
        return alertRepo.countByIsResolvedFalse();
    }

    public List<Alert> getActiveAlerts() {
        return alertRepo.findByIsResolvedFalseOrderByCreatedAtDesc();
    }

    public List<Alert> getAllAlerts() {
        return alertRepo.findAll();
    }

    public Alert createAlert(Alert alert) {
        return alertRepo.save(alert);
    }

    public Alert resolveAlert(Long id) {
        Alert alert = alertRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("预警", id));
        alert.setIsResolved(true);
        alert.setIsRead(true);
        return alertRepo.save(alert);
    }

    public void deleteAlert(Long id) {
        alertRepo.deleteById(id);
    }

    // ============ 操作日志 ============

    public List<OperationLog> getOperationLogs() {
        return logRepo.findAll();
    }

    public OperationLog addOperationLog(OperationLog log) {
        return logRepo.save(log);
    }
}
