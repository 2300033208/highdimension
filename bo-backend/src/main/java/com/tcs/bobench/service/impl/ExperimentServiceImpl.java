package com.tcs.bobench.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.tcs.bobench.dto.ExperimentRequest;
import com.tcs.bobench.dto.ExperimentResponse;
import com.tcs.bobench.entity.*;
import com.tcs.bobench.repository.BenchmarkResultRepository;
import com.tcs.bobench.repository.ExperimentRepository;
import com.tcs.bobench.repository.RecommendationRepository;
import com.tcs.bobench.service.ExperimentService;
import com.tcs.bobench.service.PythonEngineClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExperimentServiceImpl implements ExperimentService {
    @Autowired private ExperimentRepository experimentRepository;
    @Autowired private BenchmarkResultRepository benchmarkResultRepository;
    @Autowired private RecommendationRepository recommendationRepository;
    @Autowired private EntityManager entityManager;
    @Autowired private PythonEngineClient pythonEngineClient;

    @Override
    public ExperimentResponse createExperiment(ExperimentRequest request, Long userId) {
        Experiment experiment = new Experiment();
        experiment.setName(request.getName());
        experiment.setStatus("RUNNING");
        experiment.setUser(entityManager.getReference(User.class, userId));
        
        int dims = 10;
        int budget = 25;
        
        if (request.getDatasetId() != null) {
            Dataset ds = entityManager.find(Dataset.class, request.getDatasetId());
            if (ds != null) {
                experiment.setDataset(ds);
                if (ds.getColumns() != null && ds.getColumns() > 0) dims = ds.getColumns();
                if (ds.getRows() != null && ds.getRows() > 0) budget = Math.min(ds.getRows(), 50);
            }
        }
        if (request.getProblemStatementId() != null) {
            ProblemStatement ps = entityManager.find(ProblemStatement.class, request.getProblemStatementId());
            if (ps != null) {
                experiment.setProblemStatement(ps);
            }
        }
        
        experiment.setAlgorithms(request.getAlgorithms());
        Experiment saved = experimentRepository.save(experiment);
        
        try {
            // Call Python Engine with real optimization algorithms
            List<JsonNode> pythonResults = pythonEngineClient.runBenchmark(
                "exp-" + saved.getId(),
                "ackley",
                dims,
                budget,
                request.getAlgorithms()
            );
            
            double bestObjective = Double.MAX_VALUE;
            double totalRuntime = 0.0;
            
            for (JsonNode resultNode : pythonResults) {
                BenchmarkResult result = new BenchmarkResult();
                result.setExperiment(saved);
                result.setAlgorithm(resultNode.path("algorithm_id").asText());
                double val = resultNode.path("best_value").asDouble();
                double rt = resultNode.path("wall_clock_time").asDouble();
                result.setObjectiveValue(val);
                result.setRuntime(rt);
                result.setIterations(resultNode.path("n_evaluations").asInt(budget));
                result.setStatus("COMPLETED");
                benchmarkResultRepository.save(result);
                
                if (val < bestObjective) {
                    bestObjective = val;
                }
                totalRuntime += rt;
            }
            
            saved.setBestObjective(bestObjective != Double.MAX_VALUE ? bestObjective : 0.0);
            saved.setRuntime(totalRuntime);
            saved.setStatus("COMPLETED");
            experimentRepository.save(saved);

            // Auto-generate ML Recommendation for this experiment
            try {
                JsonNode mlNode = pythonEngineClient.getRecommendation(dims, budget, 20.0, false);
                Recommendation rec = new Recommendation();
                rec.setExperiment(saved);
                rec.setRecommendedAlgorithm(mlNode.path("recommended_algorithm").asText("turbo"));
                rec.setConfidence(mlNode.path("confidence_score").asDouble(0.85));
                rec.setReasoning(mlNode.path("reasoning").asText("Empirical recommendation based on meta-dataset patterns."));

                List<String> alts = new ArrayList<>();
                if (mlNode.has("ranked_algorithms") && mlNode.get("ranked_algorithms").isArray()) {
                    for (JsonNode altNode : mlNode.get("ranked_algorithms")) {
                        alts.add(altNode.asText());
                    }
                }
                rec.setAlternativeAlgorithms(alts);
                rec.setStrengths(List.of("Data-driven recommendation", "Trained on real Bayesian Optimization runs"));
                rec.setWeaknesses(List.of("Problem modality may affect convergence speed"));
                recommendationRepository.save(rec);
            } catch (Exception recEx) {
                recEx.printStackTrace();
            }
            
        } catch (Exception e) {
            saved.setStatus("FAILED");
            experimentRepository.save(saved);
            e.printStackTrace();
        }
        
        return mapToResponse(saved);
    }

    @Override
    public List<ExperimentResponse> getUserExperiments(Long userId) {
        return experimentRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ExperimentResponse getExperimentById(Long id, Long userId) {
        Experiment experiment = experimentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Experiment not found"));
        if (!experiment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return mapToResponse(experiment);
    }

    @Override
    public void deleteExperiment(Long id, Long userId) {
        Experiment experiment = experimentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Experiment not found"));
        if (!experiment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        experimentRepository.delete(experiment);
    }

    private ExperimentResponse mapToResponse(Experiment experiment) {
        ExperimentResponse response = new ExperimentResponse();
        response.setId(experiment.getId());
        response.setName(experiment.getName());
        response.setStatus(experiment.getStatus());
        response.setUserId(experiment.getUser() != null ? experiment.getUser().getId() : null);
        response.setDatasetId(experiment.getDataset() != null ? experiment.getDataset().getId() : null);
        response.setProblemStatementId(experiment.getProblemStatement() != null ? experiment.getProblemStatement().getId() : null);
        response.setAlgorithms(experiment.getAlgorithms());
        response.setCreatedAt(experiment.getCreatedAt());
        response.setRuntime(experiment.getRuntime());
        response.setBestObjective(experiment.getBestObjective());
        return response;
    }
}
