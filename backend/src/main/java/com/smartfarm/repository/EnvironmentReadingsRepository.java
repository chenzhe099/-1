package com.smartfarm.repository;

import com.smartfarm.entity.EnvironmentReadings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnvironmentReadingsRepository extends JpaRepository<EnvironmentReadings, String> {

    List<EnvironmentReadings> findByDeviceId(String deviceId);
}