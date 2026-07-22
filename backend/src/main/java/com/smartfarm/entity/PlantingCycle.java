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
@Table(name = "planting_cycles")
public class PlantingCycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long fieldId;

    private Long farmId;

    private Long cropId;

    @Column(length = 100)
    private String cropName;

    private LocalDate plantedDate;

    private LocalDate expectedHarvestDate;

    private LocalDate actualHarvestDate;

    private Double yieldTons;

    @Column(length = 20)
    private String qualityGrade;

    @Column(length = 50)
    private String growthStage;

    @Column(length = 500)
    private String notes;
}
