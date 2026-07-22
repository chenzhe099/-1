package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "farming_tasks")
public class FarmingTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String type;

    private Long fieldId;

    @Column(length = 50)
    private String fieldCode;

    @Column(length = 100)
    private String cropName;

    private LocalDateTime scheduledTime;

    private Double estimatedDuration;

    @Column(length = 20)
    private String status;

    private Long assignedTo;

    @Column(length = 20)
    private String priority;

    @Column(length = 500)
    private String notes;

    private LocalDateTime completedAt;
}
