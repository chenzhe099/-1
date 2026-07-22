package com.smartfarm.repository;

import com.smartfarm.entity.FarmingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FarmingTaskRepository extends JpaRepository<FarmingTask, Long> {

    List<FarmingTask> findByFieldId(Long fieldId);

    List<FarmingTask> findByStatus(String status);

    List<FarmingTask> findByScheduledTimeBetween(LocalDateTime start, LocalDateTime end);

    List<FarmingTask> findByAssignedTo(Long userId);
}
