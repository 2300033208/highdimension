package com.tcs.bobench.dto;

public class BenchmarkResultRequest {
    private Long experimentId;
    private String algorithm;
    private Double runtime;
    private Double objectiveValue;
    private Double cpuUsage;
    private Double memoryUsage;
    private String status;
    private Integer iterations;

    public BenchmarkResultRequest() {}

    public Long getExperimentId() { return experimentId; }
    public void setExperimentId(Long experimentId) { this.experimentId = experimentId; }
    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }
    public Double getRuntime() { return runtime; }
    public void setRuntime(Double runtime) { this.runtime = runtime; }
    public Double getObjectiveValue() { return objectiveValue; }
    public void setObjectiveValue(Double objectiveValue) { this.objectiveValue = objectiveValue; }
    public Double getCpuUsage() { return cpuUsage; }
    public void setCpuUsage(Double cpuUsage) { this.cpuUsage = cpuUsage; }
    public Double getMemoryUsage() { return memoryUsage; }
    public void setMemoryUsage(Double memoryUsage) { this.memoryUsage = memoryUsage; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getIterations() { return iterations; }
    public void setIterations(Integer iterations) { this.iterations = iterations; }
}
