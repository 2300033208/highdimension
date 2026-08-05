package com.tcs.bobench.controller;

import com.tcs.bobench.dto.ExperimentRequest;
import com.tcs.bobench.dto.ExperimentResponse;
import com.tcs.bobench.service.ExperimentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExperimentControllerTest {

    @Mock
    private ExperimentService experimentService;

    @InjectMocks
    private ExperimentController experimentController;

    @Test
    void createExperiment_shouldReturnCreatedResponse() {
        // Given
        ExperimentRequest request = new ExperimentRequest();
        request.setName("Test Experiment");
        request.setAlgorithms(Arrays.asList("SAASBO", "TuRBO"));

        ExperimentResponse response = new ExperimentResponse();
        response.setId(1L);
        response.setName("Test Experiment");
        response.setStatus("COMPLETED");

        when(experimentService.createExperiment(request, 1L)).thenReturn(response);

        // When
        ResponseEntity<ExperimentResponse> result = experimentController.createExperiment(request, 1L);

        // Then
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getId()).isEqualTo(1L);
        assertThat(result.getBody().getName()).isEqualTo("Test Experiment");
        verify(experimentService).createExperiment(request, 1L);
    }

    @Test
    void getUserExperiments_shouldReturnList() {
        // Given
        ExperimentResponse response1 = new ExperimentResponse();
        response1.setId(1L);
        response1.setName("Experiment 1");

        ExperimentResponse response2 = new ExperimentResponse();
        response2.setId(2L);
        response2.setName("Experiment 2");

        List<ExperimentResponse> experiments = Arrays.asList(response1, response2);

        when(experimentService.getUserExperiments(1L)).thenReturn(experiments);

        // When
        ResponseEntity<List<ExperimentResponse>> result = experimentController.getUserExperiments(1L);

        // Then
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).hasSize(2);
        verify(experimentService).getUserExperiments(1L);
    }

    @Test
    void getExperimentById_shouldReturnExperiment() {
        // Given
        ExperimentResponse response = new ExperimentResponse();
        response.setId(1L);
        response.setName("Test Experiment");

        when(experimentService.getExperimentById(1L, 1L)).thenReturn(response);

        // When
        ResponseEntity<ExperimentResponse> result = experimentController.getExperimentById(1L, 1L);

        // Then
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getId()).isEqualTo(1L);
        verify(experimentService).getExperimentById(1L, 1L);
    }

    @Test
    void deleteExperiment_shouldReturnNoContent() {
        // Given
        doNothing().when(experimentService).deleteExperiment(1L, 1L);

        // When
        ResponseEntity<Void> result = experimentController.deleteExperiment(1L, 1L);

        // Then
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).isNull();
        verify(experimentService).deleteExperiment(1L, 1L);
    }
}