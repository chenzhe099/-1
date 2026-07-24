package com.smartfarm.repository;

import com.smartfarm.entity.PlantingCycles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlantingCyclesRepository extends JpaRepository<PlantingCycles, String> {

    List<PlantingCycles> findByFarmId(String farmId);
    List<PlantingCycles> findByFieldId(String fieldId);
    List<PlantingCycles> findByCropId(String cropId);
}