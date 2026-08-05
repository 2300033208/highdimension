package com.tcs.bobench.controller;

import com.tcs.bobench.dto.DatasetRequest;
import com.tcs.bobench.dto.DatasetResponse;
import com.tcs.bobench.service.DatasetService;
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
class DatasetControllerTest {

    @Mock
    private DatasetService datasetService;

    @InjectMocks
    private DatasetController datasetController;

    @Test
    void createDataset_shouldReturnCreatedResponse() {
        // Given
        DatasetRequest request = new DatasetRequest();
        request.setName("Test Dataset");
        request.setPath("/data/test.csv");
        request.setRows(100);
        request.setColumns(5);
        request.setTarget("target_column");

        DatasetResponse response = new DatasetResponse();
        response.setId(1L);
        response.setName("Test Dataset");
        response.setRows(100);
        response.setColumns(5);

        when(datasetService.createDataset(request, 1L)).thenReturn(response);

        // When
        ResponseEntity<DatasetResponse> result = datasetController.createDataset(request, 1L);

        // Then
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getId()).isEqualTo(1L);
        assertThat(result.getBody().getName()).isEqualTo("Test Dataset");
        verify(datasetService).createDataset(request, 1L);
    }

    @Test
    void getUserDatasets_shouldReturnList() {
        // Given
        DatasetResponse response1 = new DatasetResponse();
        response1.setId(1L);
        response1.setName("Dataset 1");

        DatasetResponse response2 = new DatasetResponse();
        response2.setId(2L);
        response2.setName("Dataset 2");

        List<DatasetResponse> datasets = Arrays.asList(response1, response2);

        when(datasetService.getUserDatasets(1L)).thenReturn(datasets);

        // When
        ResponseEntity<List<DatasetResponse>> result = datasetController.getUserDatasets(1L);

        // Then
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).hasSize(2);
        verify(datasetService).getUserDatasets(1L);
    }

    @Test
    void getDatasetById_shouldReturnDataset() {
        // Given
        DatasetResponse response = new DatasetResponse();
        response.setId(1L);
        response.setName("Test Dataset");

        when(datasetService.getDatasetById(1L, 1L)).thenReturn(response);

        // When
        ResponseEntity<DatasetResponse> result = datasetController.getDatasetById(1L, 1L);

        // Then
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getId()).isEqualTo(1L);
        verify(datasetService).getDatasetById(1L, 1L);
    }

    @Test
    void deleteDataset_shouldReturnNoContent() {
        // Given
        doNothing().when(datasetService).deleteDataset(1L, 1L);

        // When
        ResponseEntity<Void> result = datasetController.deleteDataset(1L, 1L);

        // Then
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).isNull();
        verify(datasetService).deleteDataset(1L, 1L);
    }
}