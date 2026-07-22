package com.smartfarm.repository;

import com.smartfarm.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByIsResolvedFalse();

    List<Alert> findByIsResolvedFalseOrderByCreatedAtDesc();

    long countByIsResolvedFalse();
}
