package com.smartfarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModelVersionDTO {

    private Long id;
    private String modelName;
    private String version;
    private String deployedAt;
    private Double accuracy;
    private Double driftScore;
    private String status;
    private String description;
}
