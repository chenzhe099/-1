package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "disease_records")
public class DiseaseRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long fieldId;

    @Column(length = 50)
    private String fieldCode;

    @Column(length = 100)
    private String diseaseName;

    @Column(length = 100)
    private String cropAffected;

    private LocalDateTime detectedAt;

    @Column(length = 20)
    private String severity;

    @Column(length = 20)
    private String status;

    @Column(length = 200)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String treatmentPlan;

    private LocalDateTime resolvedAt;
}
