package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "devices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Devices {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "type")
    private String type;

    @Column(name = "location")
    private String location;

    @Column(name = "status")
    private String status;

    @Column(name = "metrics")
    private String metrics;

    @Column(name = "runHours")
    private Integer runHours;

    @Column(name = "lastMaintenance")
    private String lastMaintenance;

    @Column(name = "nextMaintenance")
    private String nextMaintenance;

    @Column(name = "ipAddress")
    private String ipAddress;

    @Column(name = "firmwareVersion")
    private String firmwareVersion;

}