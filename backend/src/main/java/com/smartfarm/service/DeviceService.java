package com.smartfarm.service;

import com.smartfarm.dto.DeviceDTO;
import com.smartfarm.entity.Device;
import com.smartfarm.entity.MaintenanceRecord;
import com.smartfarm.exception.ResourceNotFoundException;
import com.smartfarm.repository.DeviceRepository;
import com.smartfarm.repository.MaintenanceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepo;
    private final MaintenanceRecordRepository maintenanceRepo;

    public Map<String, Object> getDeviceStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", deviceRepo.count());
        stats.put("online", deviceRepo.countByStatus("online"));
        stats.put("fault", deviceRepo.countByStatus("fault"));
        stats.put("maintenance", maintenanceRepo.findByStatus("pending").size());
        return stats;
    }

    public List<DeviceDTO> getAllDevices() {
        return deviceRepo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public DeviceDTO getDeviceById(Long id) {
        Device d = deviceRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("设备", id));
        return toDTO(d);
    }

    public DeviceDTO createDevice(Device device) {
        deviceRepo.save(device);
        return toDTO(device);
    }

    public DeviceDTO updateDevice(Long id, Device updated) {
        Device d = deviceRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("设备", id));
        if (updated.getStatus() != null) d.setStatus(updated.getStatus());
        if (updated.getMetrics() != null) d.setMetrics(updated.getMetrics());
        if (updated.getFirmwareVersion() != null) d.setFirmwareVersion(updated.getFirmwareVersion());
        deviceRepo.save(d);
        return toDTO(d);
    }

    public void deleteDevice(Long id) {
        deviceRepo.deleteById(id);
    }

    public List<MaintenanceRecord> getMaintenanceByDevice(Long deviceId) {
        return maintenanceRepo.findByDeviceId(deviceId);
    }

    public MaintenanceRecord createMaintenance(MaintenanceRecord record) {
        return maintenanceRepo.save(record);
    }

    private DeviceDTO toDTO(Device d) {
        return DeviceDTO.builder()
                .id(d.getId()).name(d.getName()).type(d.getType())
                .location(d.getLocation()).status(d.getStatus())
                .metrics(d.getMetrics()).runHours(d.getRunHours())
                .lastMaintenance(d.getLastMaintenance()).nextMaintenance(d.getNextMaintenance())
                .ipAddress(d.getIpAddress()).firmwareVersion(d.getFirmwareVersion()).build();
    }
}
