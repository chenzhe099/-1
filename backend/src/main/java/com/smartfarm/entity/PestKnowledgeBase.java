package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pest_knowledge_base")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PestKnowledgeBase {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "scientificName")
    private String scientificName;

    @Column(name = "symptoms")
    private String symptoms;

    @Column(name = "causes")
    private String causes;

    @Column(name = "prevention")
    private String prevention;

    @Column(name = "chemicalControl")
    private String chemicalControl;

    @Column(name = "biologicalControl")
    private String biologicalControl;

    @Column(name = "agriculturalControl")
    private String agriculturalControl;

    @Column(name = "affectedCrops")
    private String affectedCrops;

    @Column(name = "severity")
    private String severity;

    @Column(name = "icon")
    private String icon;

    @Column(name = "color")
    private String color;

}