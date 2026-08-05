package com.tcs.bobench.service;

import com.tcs.bobench.dto.PlatformStatsDto;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    public PlatformStatsDto getPlatformStats() {
        // Returning mocked dummy data for now
        return PlatformStatsDto.builder()
                .totalUsers(142)
                .totalExperiments(1205)
                .successRate(94.5)
                .monthlyTrends("{\"Jan\": 10, \"Feb\": 15, \"Mar\": 25, \"Apr\": 40}")
                .build();
    }
}
