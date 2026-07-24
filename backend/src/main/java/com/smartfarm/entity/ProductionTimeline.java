package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "production_timeline")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionTimeline {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "productId")
    private String productId;

    @Column(name = "productName")
    private String productName;

    @Column(name = "batchNumber")
    private String batchNumber;

    @Column(name = "stage")
    private String stage;

    @Column(name = "date")
    private String date;

    @Column(name = "location")
    private String location;

    @Column(name = "description")
    private String description;

    @Column(name = "operator")
    private String operator;

}