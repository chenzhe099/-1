package com.smartfarm.repository;

import com.smartfarm.entity.Observations;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObservationsRepository extends JpaRepository<Observations, String> {
    List<Observations> findByFieldId(String fieldId);
    List<Observations> findByCycleId(String cycleId);
    List<Observations> findByFarmId(String farmId);
}
