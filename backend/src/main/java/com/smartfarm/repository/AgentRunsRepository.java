package com.smartfarm.repository;

import com.smartfarm.entity.AgentRuns;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AgentRunsRepository extends JpaRepository<AgentRuns, String> {
    List<AgentRuns> findByAgentType(String agentType);
    List<AgentRuns> findByStatus(String status);
}
