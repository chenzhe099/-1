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
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String name;

    @Column(length = 50)
    private String category;

    private Double quantity;

    @Column(length = 20)
    private String unit;

    private Double thresholdLow;

    @Column(length = 100)
    private String supplier;

    private LocalDate lastRestocked;

    @Column(length = 20)
    private String status;
}
