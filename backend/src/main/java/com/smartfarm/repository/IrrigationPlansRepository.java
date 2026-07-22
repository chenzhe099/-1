package com.smartfarm.repository;

import com.smartfarm.entity.IrrigationPlans;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IrrigationPlansRepository extends JpaRepository<IrrigationPlans, String> {

    List<IrrigationPlans> findByStatus(String status);
    List<IrrigationPlans> findByFieldId(String fieldId);
}