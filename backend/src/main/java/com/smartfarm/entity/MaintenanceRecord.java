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
@Table(name = "maintenance_records")
public class MaintenanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long deviceId;

    @Column(length = 50)
    private String type;

    @Column(length = 200)
    private String description;

    @Column(length = 20)
    private String status;

    private LocalDate scheduledDate;

    private LocalDate completedDate;

    private Long technicianId;
}
