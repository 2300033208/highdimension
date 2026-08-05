package com.tcs.bobench.dto;

import java.time.LocalDateTime;

public class DatasetResponse {
    private Long id;
    private String name;
    private String path;
    private Long ownerId;
    private Integer rows;
    private Integer columns;
    private String target;
    private LocalDateTime createdAt;

    public DatasetResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public Integer getRows() { return rows; }
    public void setRows(Integer rows) { this.rows = rows; }
    public Integer getColumns() { return columns; }
    public void setColumns(Integer columns) { this.columns = columns; }
    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
