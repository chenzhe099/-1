package com.smartfarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FieldDTO {

    private Long id;
    private Long farmId;
    private String code;
    private String name;
    private Long cropId;
    private String cropName;
    private String area;
    private String status;
    private String soilMoisture;
    private String soilPh;
    private String plantedDate;
    private String expectedHarvest;
}
