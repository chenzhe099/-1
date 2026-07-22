package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "agent_runs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentRuns {

    @Id
    private String id;

    @Column(name = "agent_name")
    private String agentName;

    @Column(name = "task_type")
    private String taskType;

    @Column(name = "started_at")
    private String startedAt;

    @Column(name = "completed_at")
    private String completedAt;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "input_summary")
    private String inputSummary;

    @Column(name = "output_summary", columnDefinition = "TEXT")
    private String outputSummary;

    private String status;

    @Column(name = "tokens_used")
    private Integer tokensUsed;

    @Column(name = "model_version_id")
    private String modelVersionId;

    @Column(name = "rag_sources", columnDefinition = "TEXT")
    private String ragSources;

    @Column(name = "human_review_needed")
    private Boolean humanReviewNeeded;

    @Column(name = "review_status")
    private String reviewStatus;

    @Column(name = "reviewer_id")
    private String reviewerId;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;
}
