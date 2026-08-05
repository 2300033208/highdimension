package com.tcs.bobench.controller;

import com.tcs.bobench.dto.ProblemStatementRequest;
import com.tcs.bobench.dto.ProblemStatementResponse;
import com.tcs.bobench.service.ProblemStatementService;
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
class ProblemStatementControllerTest {

    @Mock
    private ProblemStatementService problemStatementService;

    @InjectMocks
    private ProblemStatementController problemStatementController;

    @Test
    void createProblemStatement_shouldReturnCreatedResponse() {
        // Given
        ProblemStatementRequest request = new ProblemStatementRequest();
        request.setTitle("Test Problem");
        request.setDescription("Optimize this function");
        request.setObjective("Minimize");

        ProblemStatementResponse response = new ProblemStatementResponse();
        response.setId(1L);
        response.setTitle("Test Problem");

        when(problemStatementService.createProblemStatement(request, 1L)).thenReturn(response);

        // When
        ResponseEntity<ProblemStatementResponse> result = problemStatementController.createProblemStatement(request, 1L);

        // Then
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getId()).isEqualTo(1L);
        assertThat(result.getBody().getTitle()).isEqualTo("Test Problem");
        verify(problemStatementService).createProblemStatement(request, 1L);
    }

    @Test
    void getUserProblemStatements_shouldReturnList() {
        // Given
        ProblemStatementResponse response1 = new ProblemStatementResponse();
        response1.setId(1L);
        response1.setTitle("Problem 1");

        ProblemStatementResponse response2 = new ProblemStatementResponse();
        response2.setId(2L);
        response2.setTitle("Problem 2");

        List<ProblemStatementResponse> problems = Arrays.asList(response1, response2);

        when(problemStatementService.getUserProblemStatements(1L)).thenReturn(problems);

        // When
        ResponseEntity<List<ProblemStatementResponse>> result = problemStatementController.getUserProblemStatements(1L);

        // Then
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).hasSize(2);
        verify(problemStatementService).getUserProblemStatements(1L);
    }

    @Test
    void getProblemStatementById_shouldReturnProblem() {
        // Given
        ProblemStatementResponse response = new ProblemStatementResponse();
        response.setId(1L);
        response.setTitle("Test Problem");

        when(problemStatementService.getProblemStatementById(1L, 1L)).thenReturn(response);

        // When
        ResponseEntity<ProblemStatementResponse> result = problemStatementController.getProblemStatementById(1L, 1L);

        // Then
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getId()).isEqualTo(1L);
        verify(problemStatementService).getProblemStatementById(1L, 1L);
    }

    @Test
    void deleteProblemStatement_shouldReturnNoContent() {
        // Given
        doNothing().when(problemStatementService).deleteProblemStatement(1L, 1L);

        // When
        ResponseEntity<Void> result = problemStatementController.deleteProblemStatement(1L, 1L);

        // Then
        assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(result.getBody()).isNull();
        verify(problemStatementService).deleteProblemStatement(1L, 1L);
    }
}