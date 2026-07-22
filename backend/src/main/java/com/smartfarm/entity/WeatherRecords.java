package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "weather_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherRecords {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "date")
    private String date;

    @Column(name = "temperatureHigh")
    private Integer temperatureHigh;

    @Column(name = "temperatureLow")
    private Integer temperatureLow;

    @Column(name = "humidity")
    private Integer humidity;

    @Column(name = "rainfall_mm")
    private Integer rainfall_mm;

    @Column(name = "windSpeed")
    private Double windSpeed;

    @Column(name = "condition")
    private String condition;

    @Column(name = "forecast")
    private String forecast;

}