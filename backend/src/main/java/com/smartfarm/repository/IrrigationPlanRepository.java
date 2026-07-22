package com.smartfarm.repository;

import com.smartfarm.entity.IrrigationPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IrrigationPlanRepository extends JpaRepository<IrrigationPlan, Long> {

    List<IrrigationPlan> findByFieldId(Long fieldId);

    List<IrrigationPlan> findByStatus(String status);
}
