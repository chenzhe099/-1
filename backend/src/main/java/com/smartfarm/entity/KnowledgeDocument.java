package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "knowledge_documents")
public class KnowledgeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 200)
    private String title;

    @Column(length = 50)
    private String category;

    @Column(length = 100)
    private String cropTarget;

    @Column(columnDefinition = "TEXT")
    private String originalText;

    @Column(length = 200)
    private String sourceRegulation;

    @Column(columnDefinition = "TEXT")
    private String keywords;

    private LocalDate publishDate;
}
