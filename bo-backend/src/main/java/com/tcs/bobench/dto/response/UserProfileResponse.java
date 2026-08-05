package com.tcs.bobench.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String profilePicture;
    private String institution;
    private String organization;
    private String department;
    private String bio;
    private String role;
    private String accountStatus;
    private boolean emailVerified;
    private String membershipType;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    
    // Aggregated Stats
    private long experimentCount;
    private long datasetCount;
    private long algorithmsUsedCount;
    private long aiChatCount;
    private long reportsCount;
    private double totalRuntimeHours;
    private double storageUsedMb;
    private String apiStatus;
    
    private List<String> researchInterests;
    private List<String> achievements;
    private List<MonthlyStat> monthlyStats;
    private List<RecentExperiment> recentExperiments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyStat {
        private String month;
        private long runs;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentExperiment {
        private Long id;
        private String name;
        private String status;
        private String mode;
        private String started;
    }
}
