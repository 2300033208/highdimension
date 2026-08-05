package com.tcs.bobench.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "datasets")
public class Dataset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String path;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;
    
    @Column(name = "num_rows")
    private Integer rows;
    @Column(name = "num_columns")
    private Integer columns;
    private String target;
    private LocalDateTime createdAt;

    public Dataset() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
    public Integer getRows() { return rows; }
    public void setRows(Integer rows) { this.rows = rows; }
    public Integer getColumns() { return columns; }
    public void setColumns(Integer columns) { this.columns = columns; }
    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
