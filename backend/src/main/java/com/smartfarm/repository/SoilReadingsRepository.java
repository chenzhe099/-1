package com.smartfarm.repository;

import com.smartfarm.entity.SoilReadings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SoilReadingsRepository extends JpaRepository<SoilReadings, String> {

    List<SoilReadings> findByFieldId(String fieldId);
}