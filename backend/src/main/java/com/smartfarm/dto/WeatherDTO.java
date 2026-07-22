package com.smartfarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherDTO {

    private String date;
    private Double temperatureHigh;
    private Double temperatureLow;
    private Double humidity;
    private Double rainfallMm;
    private Double windSpeed;
    private String condition;
    private String forecast;
}
