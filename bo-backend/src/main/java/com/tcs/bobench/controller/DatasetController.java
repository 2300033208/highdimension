package com.tcs.bobench.controller;

import com.tcs.bobench.dto.DatasetRequest;
import com.tcs.bobench.dto.DatasetResponse;
import com.tcs.bobench.service.DatasetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/datasets")
public class DatasetController {
    
    @Autowired
    private DatasetService datasetService;

    @PostMapping
    public ResponseEntity<DatasetResponse> createDataset(
            @RequestBody DatasetRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return new ResponseEntity<>(datasetService.createDataset(request, userId), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DatasetResponse>> getUserDatasets(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(datasetService.getUserDatasets(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DatasetResponse> getDatasetById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(datasetService.getDatasetById(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDataset(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        datasetService.deleteDataset(id, userId);
        return ResponseEntity.noContent().build();
    }
}
