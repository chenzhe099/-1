package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "disease_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiseaseRecords {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "fieldId")
    private String fieldId;

    @Column(name = "fieldCode")
    private String fieldCode;

    @Column(name = "diseaseName")
    private String diseaseName;

    @Column(name = "cropAffected")
    private String cropAffected;

    @Column(name = "detectedAt")
    private String detectedAt;

    @Column(name = "severity")
    private String severity;

    @Column(name = "status")
    private String status;

    @Column(name = "imageUrl")
    private String imageUrl;

    @Column(name = "treatmentPlan")
    private String treatmentPlan;

    @Column(name = "resolvedAt")
    private String resolvedAt;

}