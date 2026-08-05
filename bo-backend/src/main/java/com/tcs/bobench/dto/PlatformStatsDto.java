package com.tcs.bobench.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class PlatformStatsDto {
    private long totalUsers;
    private long totalExperiments;
    private double successRate;
    private String monthlyTrends;
}
