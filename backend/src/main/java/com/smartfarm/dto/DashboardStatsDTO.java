package com.smartfarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {

    private long tasksToday;
    private int deviceOnlineRate;
    private long alertCount;
    private double monthlyYield;

    private double tasksChange;
    private double deviceChange;
    private double yieldChange;
    private String yieldUnit;
}
