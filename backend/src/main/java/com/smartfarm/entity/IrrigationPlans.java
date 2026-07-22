package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "irrigation_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IrrigationPlans {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "fieldId")
    private String fieldId;

    @Column(name = "fieldCode")
    private String fieldCode;

    @Column(name = "cropName")
    private String cropName;

    @Column(name = "targetMoisture")
    private Integer targetMoisture;

    @Column(name = "currentMoisture")
    private Integer currentMoisture;

    @Column(name = "waterVolume")
    private Integer waterVolume;

    @Column(name = "estimatedDuration")
    private Integer estimatedDuration;

    @Column(name = "status")
    private String status;

    @Column(name = "scheduledAt")
    private String scheduledAt;

    @Column(name = "executedAt")
    private String executedAt;

}