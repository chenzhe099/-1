package com.smartfarm.repository;

import com.smartfarm.entity.FertilizationPlans;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FertilizationPlansRepository extends JpaRepository<FertilizationPlans, String> {

    List<FertilizationPlans> findByStatus(String status);
    List<FertilizationPlans> findByFieldId(String fieldId);
}