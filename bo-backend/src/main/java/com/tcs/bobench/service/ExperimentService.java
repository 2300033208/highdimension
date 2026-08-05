package com.tcs.bobench.service;

import com.tcs.bobench.dto.ExperimentRequest;
import com.tcs.bobench.dto.ExperimentResponse;
import java.util.List;

public interface ExperimentService {
    ExperimentResponse createExperiment(ExperimentRequest request, Long userId);
    List<ExperimentResponse> getUserExperiments(Long userId);
    ExperimentResponse getExperimentById(Long id, Long userId);
    void deleteExperiment(Long id, Long userId);
}
