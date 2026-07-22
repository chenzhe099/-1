package com.smartfarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceRecordDTO {

    private String cropName;
    private Double pricePerKg;
    private String unit;
    private String market;
    private String date;
    private Double changePercent;
    private String trend;
}
