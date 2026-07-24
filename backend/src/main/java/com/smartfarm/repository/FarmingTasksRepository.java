package com.smartfarm.repository;

import com.smartfarm.entity.FarmingTasks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FarmingTasksRepository extends JpaRepository<FarmingTasks, String> {

    List<FarmingTasks> findByStatus(String status);
    List<FarmingTasks> findByFieldId(String fieldId);
}