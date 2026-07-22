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
@Table(name = "devices")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String name;

    @Column(length = 50)
    private String type;

    @Column(length = 100)
    private String location;

    @Column(length = 20)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String metrics;

    private Integer runHours;

    private LocalDate lastMaintenance;

    private LocalDate nextMaintenance;

    @Column(length = 50)
    private String ipAddress;

    @Column(length = 50)
    private String firmwareVersion;
}
