package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "environment_readings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnvironmentReadings {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "timestamp")
    private String timestamp;

    @Column(name = "temperature")
    private Integer temperature;

    @Column(name = "humidity")
    private Integer humidity;

    @Column(name = "deviceId")
    private String deviceId;

    @Column(name = "location")
    private String location;

}