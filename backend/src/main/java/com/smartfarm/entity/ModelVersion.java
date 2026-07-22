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
@Table(name = "model_versions")
public class ModelVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String modelName;

    @Column(length = 50)
    private String version;

    private LocalDateTime deployedAt;

    private Double accuracy;

    private Double driftScore;

    @Column(length = 20)
    private String status;

    private Integer totalPredictions;

    private Double unknownRate;

    @Column(columnDefinition = "TEXT")
    private String description;
}
