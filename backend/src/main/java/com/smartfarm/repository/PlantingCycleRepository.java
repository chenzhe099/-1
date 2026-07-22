package com.smartfarm.repository;

import com.smartfarm.entity.PlantingCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlantingCycleRepository extends JpaRepository<PlantingCycle, Long> {

    List<PlantingCycle> findByFieldId(Long fieldId);

    List<PlantingCycle> findByFarmId(Long farmId);

    List<PlantingCycle> findByActualHarvestDateIsNull();
}
