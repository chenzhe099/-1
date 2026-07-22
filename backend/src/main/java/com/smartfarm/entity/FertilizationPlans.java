package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fertilization_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FertilizationPlans {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "fieldId")
    private String fieldId;

    @Column(name = "fieldCode")
    private String fieldCode;

    @Column(name = "cropName")
    private String cropName;

    @Column(name = "nKg")
    private Integer nKg;

    @Column(name = "pKg")
    private Integer pKg;

    @Column(name = "kKg")
    private Integer kKg;

    @Column(name = "organicKg")
    private Integer organicKg;

    @Column(name = "status")
    private String status;

    @Column(name = "scheduledAt")
    private String scheduledAt;

    @Column(name = "executedAt")
    private String executedAt;

}