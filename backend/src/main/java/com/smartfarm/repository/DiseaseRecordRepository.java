package com.smartfarm.repository;

import com.smartfarm.entity.DiseaseRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DiseaseRecordRepository extends JpaRepository<DiseaseRecord, Long> {

    List<DiseaseRecord> findByFieldId(Long fieldId);

    List<DiseaseRecord> findByStatus(String status);

    List<DiseaseRecord> findByDetectedAtBetween(LocalDateTime start, LocalDateTime end);
}
