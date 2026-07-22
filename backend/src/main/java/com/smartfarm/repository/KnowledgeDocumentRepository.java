package com.smartfarm.repository;

import com.smartfarm.entity.KnowledgeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, Long> {

    List<KnowledgeDocument> findByCategory(String category);

    List<KnowledgeDocument> findByTitleContainingOrOriginalTextContaining(String title, String originalText);
}
