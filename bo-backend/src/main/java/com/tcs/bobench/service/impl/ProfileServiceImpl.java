package com.tcs.bobench.service.impl;

import com.tcs.bobench.dto.request.UpdateProfileRequest;
import com.tcs.bobench.dto.response.UserProfileResponse;
import com.tcs.bobench.entity.Dataset;
import com.tcs.bobench.entity.Experiment;
import com.tcs.bobench.entity.User;
import com.tcs.bobench.repository.DatasetRepository;
import com.tcs.bobench.repository.ExperimentRepository;
import com.tcs.bobench.repository.ReportRepository;
import com.tcs.bobench.repository.UserRepository;
import com.tcs.bobench.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final ExperimentRepository experimentRepository;
    private final DatasetRepository datasetRepository;
    private final ReportRepository reportRepository;

    @Override
    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Experiment> userExperiments = experimentRepository.findAll().stream()
                .filter(e -> e.getUser() != null && e.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());

        List<Dataset> userDatasets = datasetRepository.findAll().stream()
                .filter(d -> d.getOwner() != null && d.getOwner().getId().equals(user.getId()))
                .collect(Collectors.toList());

        List<Long> userExpIds = userExperiments.stream().map(Experiment::getId).collect(Collectors.toList());
        long reportCount = reportRepository.findAll().stream()
                .filter(r -> r.getExperimentId() != null && userExpIds.contains(r.getExperimentId()))
                .count();

        // Calculate algorithms used
        long algorithmsUsedCount = userExperiments.stream()
                .filter(e -> e.getAlgorithms() != null)
                .flatMap(e -> e.getAlgorithms().stream())
                .distinct()
                .count();

        // Calculate storage (Mocking 8 bytes per cell)
        double storageBytes = userDatasets.stream()
                .mapToDouble(d -> (d.getRows() != null ? d.getRows() : 0) * (d.getColumns() != null ? d.getColumns() : 0) * 8.0)
                .sum();
        double storageUsedMb = storageBytes / (1024 * 1024);

        // Calculate total runtime
        double totalRuntimeHours = userExperiments.stream()
                .mapToDouble(e -> e.getRuntime() != null ? e.getRuntime() : 0.0)
                .sum();

        // Build Recent Experiments
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");
        List<UserProfileResponse.RecentExperiment> recentExperiments = userExperiments.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(e -> UserProfileResponse.RecentExperiment.builder()
                        .id(e.getId())
                        .name(e.getName())
                        .status(e.getStatus())
                        .mode(e.getDataset() != null ? "dataset" : "problem-statement")
                        .started(e.getCreatedAt().format(formatter))
                        .build())
                .collect(Collectors.toList());

        // Build Monthly Stats
        Map<String, Long> monthlyCounts = userExperiments.stream()
                .collect(Collectors.groupingBy(e -> e.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM")), Collectors.counting()));
        
        // Ensure some defaults for the chart if empty
        List<String> months = List.of("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
        List<UserProfileResponse.MonthlyStat> monthlyStats = months.stream()
                .map(m -> UserProfileResponse.MonthlyStat.builder()
                        .month(m)
                        .runs(monthlyCounts.getOrDefault(m, 0L))
                        .build())
                .collect(Collectors.toList());

        // Derive achievements
        List<String> achievements = new ArrayList<>();
        if (!userExperiments.isEmpty()) achievements.add("First Run");
        if (!userDatasets.isEmpty()) achievements.add("Data Pioneer");
        if (userExperiments.size() >= 10) achievements.add("Power User");
        if (user.getAiChatCount() >= 20) achievements.add("AI Whisperer");

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profilePicture(user.getProfilePicture())
                .institution(user.getInstitution())
                .organization(user.getOrganization())
                .department(user.getDepartment())
                .bio(user.getBio())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .emailVerified(user.isEmailVerified())
                .membershipType(user.getMembershipType())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .experimentCount(userExperiments.size())
                .datasetCount(userDatasets.size())
                .algorithmsUsedCount(algorithmsUsedCount)
                .aiChatCount(user.getAiChatCount())
                .reportsCount(reportCount)
                .totalRuntimeHours(totalRuntimeHours)
                .storageUsedMb(storageUsedMb)
                .apiStatus("Operational")
                .researchInterests(user.getResearchInterests())
                .achievements(achievements)
                .monthlyStats(monthlyStats)
                .recentExperiments(recentExperiments)
                .build();
    }

    @Override
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getName() != null) user.setName(request.getName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getOrganization() != null) user.setOrganization(request.getOrganization());
        if (request.getResearchInterests() != null) {
            user.getResearchInterests().clear();
            user.getResearchInterests().addAll(request.getResearchInterests());
        }
        if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());
        
        userRepository.save(user);
        
        return getProfile(email);
    }
}
