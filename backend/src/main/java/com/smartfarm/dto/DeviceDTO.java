package com.smartfarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceDTO {

    private Long id;
    private String name;
    private String type;
    private String location;
    private String status;
    private String metrics;
    private String runHours;
    private String lastMaintenance;
    private String nextMaintenance;
    private String ipAddress;
    private String firmwareVersion;
}
