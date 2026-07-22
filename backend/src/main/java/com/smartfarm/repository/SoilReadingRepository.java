package com.smartfarm.repository;

import com.smartfarm.entity.SoilReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SoilReadingRepository extends JpaRepository<SoilReading, Long> {

    List<SoilReading> findByFieldIdAndTimestampBetweenOrderByTimestampAsc(
            Long fieldId, LocalDateTime start, LocalDateTime end);

    Optional<SoilReading> findTop1ByFieldIdOrderByTimestampDesc(Long fieldId);
}
