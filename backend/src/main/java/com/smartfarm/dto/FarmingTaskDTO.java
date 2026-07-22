package com.smartfarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmingTaskDTO {

    private Long id;
    private String type;
    private Long fieldId;
    private String fieldCode;
    private String cropName;
    private String scheduledTime;
    private String estimatedDuration;
    private String status;
    private Long assignedTo;
    private String priority;
    private String notes;
}
