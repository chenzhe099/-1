package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "model_versions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModelVersions {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "modelName")
    private String modelName;

    @Column(name = "version")
    private String version;

    @Column(name = "deployedAt")
    private String deployedAt;

    @Column(name = "accuracy")
    private Double accuracy;

    @Column(name = "driftScore")
    private Double driftScore;

    @Column(name = "status")
    private String status;

    @Column(name = "totalPredictions")
    private Integer totalPredictions;

    @Column(name = "unknownRate")
    private Double unknownRate;

    @Column(name = "description")
    private String description;

}