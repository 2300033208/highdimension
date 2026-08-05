package com.tcs.bobench.controller;

import com.tcs.bobench.dto.ExperimentRequest;
import com.tcs.bobench.dto.ExperimentResponse;
import com.tcs.bobench.service.ExperimentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/experiments")
public class ExperimentController {
    
    @Autowired
    private ExperimentService experimentService;

    @PostMapping
    public ResponseEntity<ExperimentResponse> createExperiment(
            @RequestBody ExperimentRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return new ResponseEntity<>(experimentService.createExperiment(request, userId), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ExperimentResponse>> getUserExperiments(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(experimentService.getUserExperiments(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExperimentResponse> getExperimentById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(experimentService.getExperimentById(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExperiment(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        experimentService.deleteExperiment(id, userId);
        return ResponseEntity.noContent().build();
    }
}
