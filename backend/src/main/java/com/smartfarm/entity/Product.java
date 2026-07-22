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
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long fieldId;

    @Column(length = 100)
    private String name;

    @Column(length = 50)
    private String batchNumber;

    private Double quantityTons;

    private LocalDate harvestDate;

    @Column(length = 50)
    private String traceStatus;
}
