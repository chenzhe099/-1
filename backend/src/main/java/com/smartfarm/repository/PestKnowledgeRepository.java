package com.smartfarm.repository;

import com.smartfarm.entity.PestKnowledge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PestKnowledgeRepository extends JpaRepository<PestKnowledge, Long> {

    List<PestKnowledge> findByNameContaining(String keyword);

    List<PestKnowledge> findBySeverity(String severity);
}
