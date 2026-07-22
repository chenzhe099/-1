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
@Table(name = "irrigation_plans")
public class IrrigationPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long fieldId;

    @Column(length = 50)
    private String fieldCode;

    @Column(length = 100)
    private String cropName;

    private Integer targetMoisture;

    private Integer currentMoisture;

    private Double waterVolume;

    private Integer estimatedDuration;

    @Column(length = 20)
    private String status;

    private LocalDateTime scheduledAt;
}
