package com.smartfarm.repository;

import com.smartfarm.entity.MaintenanceRecords;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceRecordsRepository extends JpaRepository<MaintenanceRecords, String> {

    List<MaintenanceRecords> findByStatus(String status);
    List<MaintenanceRecords> findByDeviceId(String deviceId);
}