package com.smartfarm.repository;

import com.smartfarm.entity.EnvironmentReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnvironmentReadingRepository extends JpaRepository<EnvironmentReading, Long> {

    List<EnvironmentReading> findByDeviceIdAndTimestampBetweenOrderByTimestampAsc(
            Long deviceId, LocalDateTime start, LocalDateTime end);

    Optional<EnvironmentReading> findTop1ByDeviceIdOrderByTimestampDesc(Long deviceId);
}
