package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Products {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "cropId")
    private String cropId;

    @Column(name = "batchNumber")
    private String batchNumber;

    @Column(name = "fieldId")
    private String fieldId;

    @Column(name = "harvestDate")
    private String harvestDate;

    @Column(name = "quantityTons")
    private Integer quantityTons;

    @Column(name = "traceStatus")
    private String traceStatus;

    @Column(name = "qrCode")
    private String qrCode;

    @Column(name = "certifications")
    private String certifications;

}