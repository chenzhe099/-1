package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "farming_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmingTasks {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "type")
    private String type;

    @Column(name = "fieldId")
    private String fieldId;

    @Column(name = "fieldCode")
    private String fieldCode;

    @Column(name = "cropName")
    private String cropName;

    @Column(name = "scheduledTime")
    private String scheduledTime;

    @Column(name = "estimatedDuration")
    private Double estimatedDuration;

    @Column(name = "status")
    private String status;

    @Column(name = "assignedTo")
    private String assignedTo;

    @Column(name = "priority")
    private String priority;

    @Column(name = "notes")
    private String notes;

    @Column(name = "completedAt")
    private String completedAt;

}