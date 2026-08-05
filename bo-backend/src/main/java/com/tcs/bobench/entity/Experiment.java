package com.tcs.bobench.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "experiments")
public class Experiment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String status;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dataset_id")
    private Dataset dataset;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_statement_id")
    private ProblemStatement problemStatement;
    
    @ElementCollection
    @CollectionTable(name = "experiment_algorithms", joinColumns = @JoinColumn(name = "experiment_id"))
    @Column(name = "algorithm")
    private List<String> algorithms;
    
    private LocalDateTime createdAt;
    private Double runtime;
    private Double bestObjective;

    public Experiment() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Dataset getDataset() { return dataset; }
    public void setDataset(Dataset dataset) { this.dataset = dataset; }
    public ProblemStatement getProblemStatement() { return problemStatement; }
    public void setProblemStatement(ProblemStatement problemStatement) { this.problemStatement = problemStatement; }
    public List<String> getAlgorithms() { return algorithms; }
    public void setAlgorithms(List<String> algorithms) { this.algorithms = algorithms; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Double getRuntime() { return runtime; }
    public void setRuntime(Double runtime) { this.runtime = runtime; }
    public Double getBestObjective() { return bestObjective; }
    public void setBestObjective(Double bestObjective) { this.bestObjective = bestObjective; }
}
