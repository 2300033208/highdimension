package com.tcs.bobench.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "benchmark_results")
public class BenchmarkResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experiment_id")
    private Experiment experiment;
    
    private String algorithm;
    private Double runtime;
    private Double objectiveValue;
    private Double cpuUsage;
    private Double memoryUsage;
    private String status;
    private Integer iterations;

    public BenchmarkResult() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Experiment getExperiment() { return experiment; }
    public void setExperiment(Experiment experiment) { this.experiment = experiment; }
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
