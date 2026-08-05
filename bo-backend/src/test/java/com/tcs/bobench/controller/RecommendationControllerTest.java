package com.tcs.bobench.controller;

import com.tcs.bobench.dto.RecommendationRequest;
import com.tcs.bobench.dto.RecommendationResponse;
import com.tcs.bobench.service.RecommendationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecommendationControllerTest {

    @Mock
    private RecommendationService recommendationService;

    @InjectMocks
    private RecommendationController recommendationController;

    @Test
    void createRecommendation_shouldReturnCreatedResponse() {
        // Given
        RecommendationRequest request = new RecommendationRequest();
        request.setExperimentId(1L);
        request.setRecommendedAlgorithm("SAASBO");

        RecommendationResponse response = new RecommendationResponse();
        response.setId(1L);
        response.setRecommendedAlgorithm("SAASBO");
        response.setConfidence(0.95);

        when(recommendationService.createRecommendation(request)).thenReturn(response);

        // When
        ResponseEntity<RecommendationResponse> result = recommendationController.createRecommendation(request);

        // Then
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getId()).isEqualTo(1L);
        assertThat(result.getBody().getRecommendedAlgorithm()).isEqualTo("SAASBO");
        verify(recommendationService).createRecommendation(request);
    }

    @Test
    void getRecommendationByExperimentId_shouldReturnRecommendation() {
        // Given
        RecommendationResponse response = new RecommendationResponse();
        response.setId(1L);
        response.setExperimentId(1L);
        response.setRecommendedAlgorithm("SAASBO");

        when(recommendationService.getRecommendationByExperimentId(1L, 1L)).thenReturn(response);

        // When
        ResponseEntity<RecommendationResponse> result = recommendationController.getRecommendationByExperimentId(1L, 1L);

        // Then
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getId()).isEqualTo(1L);
        verify(recommendationService).getRecommendationByExperimentId(1L, 1L);
    }

    @Test
    void predictRecommendation_shouldReturnPrediction() {
        // Given
        RecommendationResponse response = new RecommendationResponse();
        response.setId(1L);
        response.setRecommendedAlgorithm("TuRBO");
        response.setConfidence(0.85);

        when(recommendationService.predictRecommendation(10, 50, 20.0, false)).thenReturn(response);

        // When
        ResponseEntity<RecommendationResponse> result = recommendationController.predictRecommendation(10, 50, 20.0, false);

        // Then
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getRecommendedAlgorithm()).isEqualTo("TuRBO");
        verify(recommendationService).predictRecommendation(10, 50, 20.0, false);
    }
}