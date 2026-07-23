package com.smartfarm.repository;

import com.smartfarm.entity.Observations;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ObservationsRepository extends JpaRepository<Observations, String> {
    List<Observations> findByFieldId(String fieldId);
    List<Observations> findByStatus(String status);
}
