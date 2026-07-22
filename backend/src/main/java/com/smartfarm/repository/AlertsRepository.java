package com.smartfarm.repository;

import com.smartfarm.entity.Alerts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlertsRepository extends JpaRepository<Alerts, String> {

    List<Alerts> findByFieldId(String fieldId);
    List<Alerts> findByIsResolved(Boolean isResolved);
}