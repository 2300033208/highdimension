package com.tcs.bobench.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.tcs.bobench.dto.RecommendationRequest;
import com.tcs.bobench.dto.RecommendationResponse;
import com.tcs.bobench.entity.Experiment;
import com.tcs.bobench.entity.Recommendation;
import com.tcs.bobench.repository.ExperimentRepository;
import com.tcs.bobench.repository.RecommendationRepository;
import com.tcs.bobench.service.PythonEngineClient;
import com.tcs.bobench.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;

import java.util.ArrayList;
import java.util.List;

@Service
public class RecommendationServiceImpl implements RecommendationService {
    @Autowired private RecommendationRepository recommendationRepository;
    @Autowired private ExperimentRepository experimentRepository;
    @Autowired private EntityManager entityManager;
    @Autowired private PythonEngineClient pythonEngineClient;

    @Override
    public RecommendationResponse createRecommendation(RecommendationRequest request) {
        Recommendation rec = new Recommendation();
        rec.setExperiment(entityManager.getReference(Experiment.class, request.getExperimentId()));
        rec.setRecommendedAlgorithm(request.getRecommendedAlgorithm());
        rec.setConfidence(request.getConfidence());
        rec.setReasoning(request.getReasoning());
        rec.setStrengths(request.getStrengths());
        rec.setWeaknesses(request.getWeaknesses());
        rec.setAlternativeAlgorithms(request.getAlternativeAlgorithms());
        
        Recommendation saved = recommendationRepository.save(rec);
        return mapToResponse(saved);
    }

    @Override
    public RecommendationResponse getRecommendationByExperimentId(Long experimentId, Long userId) {
        Experiment experiment = experimentRepository.findById(experimentId)
                .orElseThrow(() -> new RuntimeException("Experiment not found"));
        if (!experiment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        return recommendationRepository.findByExperimentId(experimentId)
                .map(this::mapToResponse)
                .orElseGet(() -> {
                    // Dynamically request ML model recommendation from Python engine
                    int dims = 10;
                    int budget = 50;
                    if (experiment.getDataset() != null) {
                        if (experiment.getDataset().getColumns() != null) dims = experiment.getDataset().getColumns();
                        if (experiment.getDataset().getRows() != null) budget = Math.min(experiment.getDataset().getRows(), 100);
                    }

                    JsonNode mlNode = pythonEngineClient.getRecommendation(dims, budget, 20.0, false);
                    Recommendation rec = new Recommendation();
                    rec.setExperiment(experiment);
                    rec.setRecommendedAlgorithm(mlNode.path("recommended_algorithm").asText("turbo"));
                    rec.setConfidence(mlNode.path("confidence_score").asDouble(0.85));
                    rec.setReasoning(mlNode.path("reasoning").asText("Derived from empirical benchmark training across parameter dimensions."));

                    List<String> alts = new ArrayList<>();
                    if (mlNode.has("ranked_algorithms") && mlNode.get("ranked_algorithms").isArray()) {
                        for (JsonNode altNode : mlNode.get("ranked_algorithms")) {
                            alts.add(altNode.asText());
                        }
                    }
                    rec.setAlternativeAlgorithms(alts);
                    rec.setStrengths(List.of("Learned from empirical benchmark experiments", "Optimized for " + dims + "D parameter space"));
                    rec.setWeaknesses(List.of("Performance depends on problem modality and landscape smoothness"));

                    Recommendation saved = recommendationRepository.save(rec);
                    return mapToResponse(saved);
                });
    }

    @Override
    public RecommendationResponse predictRecommendation(int nDimensions, int evaluationBudget, Double boundsRange, Boolean isNoisy) {
        JsonNode mlNode = pythonEngineClient.getRecommendation(nDimensions, evaluationBudget, boundsRange, isNoisy);
        RecommendationResponse response = new RecommendationResponse();
        response.setRecommendedAlgorithm(mlNode.path("recommended_algorithm").asText("turbo"));
        response.setConfidence(mlNode.path("confidence_score").asDouble(0.85));
        response.setReasoning(mlNode.path("reasoning").asText("ML model recommendation"));

        List<String> alts = new ArrayList<>();
        if (mlNode.has("ranked_algorithms") && mlNode.get("ranked_algorithms").isArray()) {
            for (JsonNode altNode : mlNode.get("ranked_algorithms")) {
                alts.add(altNode.asText());
            }
        }
        response.setAlternativeAlgorithms(alts);
        response.setStrengths(List.of("Empirically validated on meta-dataset", "Trained on real Bayesian Optimization runs"));
        response.setWeaknesses(List.of("Extreme noise or discontinuities may require specialized kernels"));
        return response;
    }

    private RecommendationResponse mapToResponse(Recommendation rec) {
        RecommendationResponse response = new RecommendationResponse();
        response.setId(rec.getId());
        response.setExperimentId(rec.getExperiment().getId());
        response.setRecommendedAlgorithm(rec.getRecommendedAlgorithm());
        response.setConfidence(rec.getConfidence());
        response.setReasoning(rec.getReasoning());
        response.setStrengths(rec.getStrengths());
        response.setWeaknesses(rec.getWeaknesses());
        response.setAlternativeAlgorithms(rec.getAlternativeAlgorithms());
        return response;
    }
}
