package com.smartfarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiseaseRecordDTO {

    private Long id;
    private Long fieldId;
    private String fieldCode;
    private String diseaseName;
    private String cropAffected;
    private String detectedAt;
    private String severity;
    private String status;
    private String imageUrl;
    private String treatmentPlan;
}
