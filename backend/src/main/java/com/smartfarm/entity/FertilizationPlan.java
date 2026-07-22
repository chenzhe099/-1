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
@Table(name = "fertilization_plans")
public class FertilizationPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long fieldId;

    @Column(length = 50)
    private String fieldCode;

    @Column(length = 100)
    private String cropName;

    private Double nKg;

    private Double pKg;

    private Double kKg;

    private Double organicKg;

    @Column(length = 20)
    private String status;

    private LocalDateTime scheduledAt;
}
