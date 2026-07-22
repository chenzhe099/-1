package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "observations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Observations {

    @Id
    private String id;

    @Column(name = "cycle_id")
    private String cycleId;

    @Column(name = "field_id")
    private String fieldId;

    @Column(name = "farm_id")
    private String farmId;

    @Column(name = "observed_at")
    private String observedAt;

    @Column(name = "observer_id")
    private String observerId;

    @Column(name = "growth_stage")
    private String growthStage;

    @Column(name = "height_cm")
    private Double heightCm;

    @Column(name = "leaf_color")
    private String leafColor;

    @Column(name = "pest_signs")
    private String pestSigns;

    @Column(name = "soil_moisture")
    private Integer soilMoisture;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
