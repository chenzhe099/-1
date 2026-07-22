package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "weather_records")
public class WeatherRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    @Column(length = 100)
    private String location;

    private Double temperatureHigh;

    private Double temperatureLow;

    private Integer humidity;

    private Double rainfallMm;

    private Double windSpeed;

    @Column(length = 50)
    private String condition;

    @Column(columnDefinition = "TEXT")
    private String forecast;
}
