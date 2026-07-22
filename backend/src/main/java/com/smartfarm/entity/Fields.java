package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fields")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fields {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "code")
    private String code;

    @Column(name = "name")
    private String name;

    @Column(name = "cropId")
    private String cropId;

    @Column(name = "cropName")
    private String cropName;

    @Column(name = "area")
    private Double area;

    @Column(name = "status")
    private String status;

    @Column(name = "soilMoisture")
    private Integer soilMoisture;

    @Column(name = "soilPh")
    private Double soilPh;

    @Column(name = "plantedDate")
    private String plantedDate;

    @Column(name = "expectedHarvest")
    private String expectedHarvest;

    @Column(name = "location")
    private String location;

}