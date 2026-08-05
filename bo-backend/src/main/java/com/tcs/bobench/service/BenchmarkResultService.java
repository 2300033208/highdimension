package com.tcs.bobench.service;

import com.tcs.bobench.dto.BenchmarkResultRequest;
import com.tcs.bobench.dto.BenchmarkResultResponse;
import java.util.List;

public interface BenchmarkResultService {
    BenchmarkResultResponse createBenchmarkResult(BenchmarkResultRequest request);
    List<BenchmarkResultResponse> getResultsByExperimentId(Long experimentId, Long userId);
}
