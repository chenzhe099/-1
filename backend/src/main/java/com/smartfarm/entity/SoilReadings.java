package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "soil_readings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoilReadings {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "timestamp")
    private String timestamp;

    @Column(name = "fieldId")
    private String fieldId;

    @Column(name = "moisture")
    private Integer moisture;

    @Column(name = "ph")
    private Double ph;

    @Column(name = "nLevel")
    private Integer nLevel;

    @Column(name = "pLevel")
    private Integer pLevel;

    @Column(name = "kLevel")
    private Integer kLevel;

}