package com.tcs.bobench.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "benchmark_library")
public class BenchmarkLibrary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String category;
    private Integer dimensionality;
    private String objectiveFunction;
    private String difficulty;
    
    @Column(columnDefinition = "TEXT")
    private String description;
}
