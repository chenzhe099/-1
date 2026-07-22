package com.smartfarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlantingCycleDTO {

    private Long id;
    private Long fieldId;
    private Long cropId;
    private String cropName;
    private String plantedDate;
    private String expectedHarvestDate;
    private String actualHarvestDate;
    private Double yieldTons;
    private String growthStage;
    private String notes;
}
