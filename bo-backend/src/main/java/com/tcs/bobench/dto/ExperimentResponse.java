package com.tcs.bobench.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ExperimentResponse {
    private Long id;
    private String name;
    private String status;
    private Long userId;
    private Long datasetId;
    private Long problemStatementId;
    private List<String> algorithms;
    private LocalDateTime createdAt;
    private Double runtime;
    private Double bestObjective;

    public ExperimentResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getDatasetId() { return datasetId; }
    public void setDatasetId(Long datasetId) { this.datasetId = datasetId; }
    public Long getProblemStatementId() { return problemStatementId; }
    public void setProblemStatementId(Long problemStatementId) { this.problemStatementId = problemStatementId; }
    public List<String> getAlgorithms() { return algorithms; }
    public void setAlgorithms(List<String> algorithms) { this.algorithms = algorithms; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Double getRuntime() { return runtime; }
    public void setRuntime(Double runtime) { this.runtime = runtime; }
    public Double getBestObjective() { return bestObjective; }
    public void setBestObjective(Double bestObjective) { this.bestObjective = bestObjective; }
}
