package com.smartfarm.repository;

import com.smartfarm.entity.FertilizationPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FertilizationPlanRepository extends JpaRepository<FertilizationPlan, Long> {

    List<FertilizationPlan> findByFieldId(Long fieldId);
}
