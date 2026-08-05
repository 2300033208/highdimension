package com.tcs.bobench.service;

import com.tcs.bobench.dto.RecommendationRequest;
import com.tcs.bobench.dto.RecommendationResponse;

public interface RecommendationService {
    RecommendationResponse createRecommendation(RecommendationRequest request);
    RecommendationResponse getRecommendationByExperimentId(Long experimentId, Long userId);
    RecommendationResponse predictRecommendation(int nDimensions, int evaluationBudget, Double boundsRange, Boolean isNoisy);
}
