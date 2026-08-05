package com.tcs.bobench.controller;

import com.tcs.bobench.dto.PlatformStatsDto;
import com.tcs.bobench.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/stats")
    public ResponseEntity<PlatformStatsDto> getPlatformStats() {
        return ResponseEntity.ok(analyticsService.getPlatformStats());
    }
}
