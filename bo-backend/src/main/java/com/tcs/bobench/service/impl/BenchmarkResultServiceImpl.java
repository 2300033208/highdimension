package com.tcs.bobench.service.impl;

import com.tcs.bobench.dto.BenchmarkResultRequest;
import com.tcs.bobench.dto.BenchmarkResultResponse;
import com.tcs.bobench.entity.BenchmarkResult;
import com.tcs.bobench.entity.Experiment;
import com.tcs.bobench.repository.BenchmarkResultRepository;
import com.tcs.bobench.repository.ExperimentRepository;
import com.tcs.bobench.service.BenchmarkResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BenchmarkResultServiceImpl implements BenchmarkResultService {
    @Autowired private BenchmarkResultRepository benchmarkResultRepository;
    @Autowired private ExperimentRepository experimentRepository;
    @Autowired private EntityManager entityManager;

    @Override
    public BenchmarkResultResponse createBenchmarkResult(BenchmarkResultRequest request) {
        BenchmarkResult result = new BenchmarkResult();
        result.setExperiment(entityManager.getReference(Experiment.class, request.getExperimentId()));
        result.setAlgorithm(request.getAlgorithm());
        result.setRuntime(request.getRuntime());
        result.setObjectiveValue(request.getObjectiveValue());
        result.setCpuUsage(request.getCpuUsage());
        result.setMemoryUsage(request.getMemoryUsage());
        result.setStatus(request.getStatus());
        result.setIterations(request.getIterations());
        
        BenchmarkResult saved = benchmarkResultRepository.save(result);
        return mapToResponse(saved);
    }

    @Override
    public List<BenchmarkResultResponse> getResultsByExperimentId(Long experimentId, Long userId) {
        Experiment experiment = experimentRepository.findById(experimentId)
                .orElseThrow(() -> new RuntimeException("Experiment not found"));
        if (!experiment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return benchmarkResultRepository.findByExperimentId(experimentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private BenchmarkResultResponse mapToResponse(BenchmarkResult result) {
        BenchmarkResultResponse response = new BenchmarkResultResponse();
        response.setId(result.getId());
        response.setExperimentId(result.getExperiment().getId());
        response.setAlgorithm(result.getAlgorithm());
        response.setRuntime(result.getRuntime());
        response.setObjectiveValue(result.getObjectiveValue());
        response.setCpuUsage(result.getCpuUsage());
        response.setMemoryUsage(result.getMemoryUsage());
        response.setStatus(result.getStatus());
        response.setIterations(result.getIterations());
        return response;
    }
}
