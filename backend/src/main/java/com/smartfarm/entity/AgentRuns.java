package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "agent_runs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentRuns {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "agentName")
    private String agentName;

    @Column(name = "agentType")
    private String agentType;

    @Column(name = "taskType")
    private String taskType;

    @Column(name = "input", columnDefinition = "TEXT")
    private String input;

    @Column(name = "output", columnDefinition = "TEXT")
    private String output;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "status")
    private String status;

    @Column(name = "durationMs")
    private Long durationMs;

    @Column(name = "startedAt")
    private String startedAt;

    @Column(name = "completedAt")
    private String completedAt;

    @Column(name = "errorMessage", columnDefinition = "TEXT")
    private String errorMessage;
}
