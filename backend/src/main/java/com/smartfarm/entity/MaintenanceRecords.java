package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "maintenance_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRecords {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "deviceId")
    private String deviceId;

    @Column(name = "deviceName")
    private String deviceName;

    @Column(name = "type")
    private String type;

    @Column(name = "status")
    private String status;

    @Column(name = "scheduledDate")
    private String scheduledDate;

    @Column(name = "completedDate")
    private String completedDate;

    @Column(name = "technicianNote")
    private String technicianNote;

    @Column(name = "cost")
    private Integer cost;

}