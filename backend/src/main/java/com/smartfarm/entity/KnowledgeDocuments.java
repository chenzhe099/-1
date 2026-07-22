package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "knowledge_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeDocuments {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "title")
    private String title;

    @Column(name = "category")
    private String category;

    @Column(name = "cropTarget")
    private String cropTarget;

    @Column(name = "originalText")
    private String originalText;

    @Column(name = "sourceRegulation")
    private String sourceRegulation;

    @Column(name = "keywords")
    private String keywords;

    @Column(name = "publishDate")
    private String publishDate;

}