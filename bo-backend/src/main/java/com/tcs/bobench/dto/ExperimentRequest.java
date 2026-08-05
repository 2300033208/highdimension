package com.tcs.bobench.dto;

import java.util.List;

public class ExperimentRequest {
    private String name;
    private String status;
    private Long datasetId;
    private Long problemStatementId;
    private List<String> algorithms;

    public ExperimentRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getDatasetId() { return datasetId; }
    public void setDatasetId(Long datasetId) { this.datasetId = datasetId; }
    public Long getProblemStatementId() { return problemStatementId; }
    public void setProblemStatementId(Long problemStatementId) { this.problemStatementId = problemStatementId; }
    public List<String> getAlgorithms() { return algorithms; }
    public void setAlgorithms(List<String> algorithms) { this.algorithms = algorithms; }
}
