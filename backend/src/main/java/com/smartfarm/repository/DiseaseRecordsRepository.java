package com.smartfarm.repository;

import com.smartfarm.entity.DiseaseRecords;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiseaseRecordsRepository extends JpaRepository<DiseaseRecords, String> {

    List<DiseaseRecords> findByStatus(String status);
    List<DiseaseRecords> findByFieldId(String fieldId);
}