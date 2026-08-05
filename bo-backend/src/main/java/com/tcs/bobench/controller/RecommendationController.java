package com.tcs.bobench.controller;

import com.tcs.bobench.dto.RecommendationRequest;
import com.tcs.bobench.dto.RecommendationResponse;
import com.tcs.bobench.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recommendations")
public class RecommendationController {
    
    @Autowired
    private RecommendationService recommendationService;

    @PostMapping
    public ResponseEntity<RecommendationResponse> createRecommendation(
            @RequestBody RecommendationRequest request) {
        return new ResponseEntity<>(recommendationService.createRecommendation(request), HttpStatus.CREATED);
    }

    @GetMapping("/experiment/{experimentId}")
    public ResponseEntity<RecommendationResponse> getRecommendationByExperimentId(
            @PathVariable Long experimentId,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(recommendationService.getRecommendationByExperimentId(experimentId, userId));
    }

    @GetMapping("/predict")
    public ResponseEntity<RecommendationResponse> predictRecommendation(
            @RequestParam(defaultValue = "10") int dimensions,
            @RequestParam(defaultValue = "50") int budget,
            @RequestParam(defaultValue = "20.0") Double boundsRange,
            @RequestParam(defaultValue = "false") Boolean isNoisy) {
        return ResponseEntity.ok(recommendationService.predictRecommendation(dimensions, budget, boundsRange, isNoisy));
    }
}
