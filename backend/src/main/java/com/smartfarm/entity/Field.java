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
@Table(name = "fields")
public class Field {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long farmId;

    @Column(length = 50)
    private String code;

    @Column(length = 100)
    private String name;

    private Long cropId;

    @Column(length = 100)
    private String cropName;

    private Double area;

    @Column(length = 20)
    private String status;

    private Integer soilMoisture;

    private Double soilPh;

    private LocalDate plantedDate;

    private LocalDate expectedHarvest;

    private Double locationLat;

    private Double locationLng;
}
