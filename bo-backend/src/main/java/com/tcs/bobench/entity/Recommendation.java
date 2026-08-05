package com.tcs.bobench.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "recommendations")
public class Recommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experiment_id")
    private Experiment experiment;
    
    private String recommendedAlgorithm;
    private Double confidence;
    @Column(length = 2000)
    private String reasoning;
    
    @ElementCollection
    @CollectionTable(name = "recommendation_strengths", joinColumns = @JoinColumn(name = "recommendation_id"))
    @Column(name = "strength")
    private List<String> strengths;
    
    @ElementCollection
    @CollectionTable(name = "recommendation_weaknesses", joinColumns = @JoinColumn(name = "recommendation_id"))
    @Column(name = "weakness")
    private List<String> weaknesses;
    
    @ElementCollection
    @CollectionTable(name = "recommendation_alternatives", joinColumns = @JoinColumn(name = "recommendation_id"))
    @Column(name = "alternative")
    private List<String> alternativeAlgorithms;

    public Recommendation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Experiment getExperiment() { return experiment; }
    public void setExperiment(Experiment experiment) { this.experiment = experiment; }
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
