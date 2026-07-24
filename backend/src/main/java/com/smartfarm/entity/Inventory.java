package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "category")
    private String category;

    @Column(name = "unit")
    private String unit;

    @Column(name = "unitWeight")
    private Integer unitWeight;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "thresholdLow")
    private Integer thresholdLow;

    @Column(name = "status")
    private String status;

    @Column(name = "lastRestocked")
    private String lastRestocked;

    @Column(name = "supplier")
    private String supplier;

}