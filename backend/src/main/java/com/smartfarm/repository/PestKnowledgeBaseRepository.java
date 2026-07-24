package com.smartfarm.repository;

import com.smartfarm.entity.PestKnowledgeBase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PestKnowledgeBaseRepository extends JpaRepository<PestKnowledgeBase, String> {

}