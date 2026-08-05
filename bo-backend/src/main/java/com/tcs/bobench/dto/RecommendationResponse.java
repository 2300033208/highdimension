package com.tcs.bobench.dto;

import java.util.List;

public class RecommendationResponse {
    private Long id;
    private Long experimentId;
    private String recommendedAlgorithm;
    private Double confidence;
    private String reasoning;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> alternativeAlgorithms;

    public RecommendationResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getExperimentId() { return experimentId; }
    public void setExperimentId(Long experimentId) { this.experimentId = experimentId; }
    public String getRecommendedAlgorithm() { return recommendedAlgorithm; }
    public void setRecommendedAlgorithm(String recommendedAlgorithm) { this.recommendedAlgorithm = recommendedAlgorithm; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    public String getReasoning() { return reasoning; }
    public void setReasoning(String reasoning) { this.reasoning = reasoning; }
    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }
    public List<String> getWeaknesses() { return weaknesses; }
    public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }
    public List<String> getAlternativeAlgorithms() { return alternativeAlgorithms; }
    public void setAlternativeAlgorithms(List<String> alternativeAlgorithms) { this.alternativeAlgorithms = alternativeAlgorithms; }
}
