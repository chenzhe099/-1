package com.smartfarm.repository;

import com.smartfarm.entity.KnowledgeDocuments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgeDocumentsRepository extends JpaRepository<KnowledgeDocuments, String> {

}