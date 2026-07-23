package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "observations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Observations {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "fieldId")
    private String fieldId;

    @Column(name = "cropName")
    private String cropName;

    @Column(name = "type")
    private String type;

    @Column(name = "title")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "severity")
    private String severity;

    @Column(name = "observedBy")
    private String observedBy;

    @Column(name = "observedAt")
    private String observedAt;

    @Column(name = "status")
    private String status;

    @Column(name = "images")
    private String images;

    @Column(name = "createdAt")
    private String createdAt;
}
