package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quality_certifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualityCertifications {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "productId")
    private String productId;

    @Column(name = "name")
    private String name;

    @Column(name = "result")
    private String result;

    @Column(name = "certNumber")
    private String certNumber;

    @Column(name = "testedAt")
    private String testedAt;

    @Column(name = "notes")
    private String notes;

}