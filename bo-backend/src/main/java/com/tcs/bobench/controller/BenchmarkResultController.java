package com.tcs.bobench.controller;

import com.tcs.bobench.dto.BenchmarkResultRequest;
import com.tcs.bobench.dto.BenchmarkResultResponse;
import com.tcs.bobench.service.BenchmarkResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/benchmark-results")
public class BenchmarkResultController {
    
    @Autowired
    private BenchmarkResultService benchmarkResultService;

    @PostMapping
    public ResponseEntity<BenchmarkResultResponse> createBenchmarkResult(
            @RequestBody BenchmarkResultRequest request) {
        return new ResponseEntity<>(benchmarkResultService.createBenchmarkResult(request), HttpStatus.CREATED);
    }

    @GetMapping("/experiment/{experimentId}")
    public ResponseEntity<List<BenchmarkResultResponse>> getResultsByExperimentId(
            @PathVariable Long experimentId,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(benchmarkResultService.getResultsByExperimentId(experimentId, userId));
    }
}
