package com.tcs.bobench.dto;

public class ProblemStatementRequest {
    private String title;
    private String description;
    private String objective;
    private String constraints;
    private String status;

    public ProblemStatementRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getObjective() { return objective; }
    public void setObjective(String objective) { this.objective = objective; }
    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
