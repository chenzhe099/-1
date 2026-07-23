package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "planting_cycles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlantingCycles {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "fieldId")
    private String fieldId;

    @Column(name = "farmId")
    private String farmId;

    @Column(name = "cropId")
    private String cropId;

    @Column(name = "cropName")
    private String cropName;

    @Column(name = "plantedDate")
    private String plantedDate;

    @Column(name = "expectedHarvestDate")
    private String expectedHarvestDate;

    @Column(name = "actualHarvestDate")
    private String actualHarvestDate;

    @Column(name = "yieldTons")
    private String yieldTons;

    @Column(name = "qualityGrade")
    private String qualityGrade;

    @Column(name = "growthStage")
    private String growthStage;

    @Column(name = "notes")
    private String notes;

}