package com.smartfarm.repository;

import com.smartfarm.entity.AgentRuns;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgentRunsRepository extends JpaRepository<AgentRuns, String> {
    List<AgentRuns> findByStatus(String status);
    List<AgentRuns> findByTaskType(String taskType);
    List<AgentRuns> findByHumanReviewNeededTrue();
    List<AgentRuns> findByHumanReviewNeededTrueAndReviewStatus(String reviewStatus);
    long countByStatus(String status);
}
