package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "crops")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Crops {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "nameEn")
    private String nameEn;

    @Column(name = "category")
    private String category;

    @Column(name = "growthDays")
    private Integer growthDays;

    @Column(name = "optimalTempMin")
    private Integer optimalTempMin;

    @Column(name = "optimalTempMax")
    private Integer optimalTempMax;

    @Column(name = "optimalHumidity")
    private Integer optimalHumidity;

    @Column(name = "icon")
    private String icon;

}