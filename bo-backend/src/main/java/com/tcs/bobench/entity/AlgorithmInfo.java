package com.tcs.bobench.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "algorithm_info")
public class AlgorithmInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String shortName;
    private String family;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String workflow;
    
    @Column(columnDefinition = "TEXT")
    private String mathConcept;
    
    @Column(columnDefinition = "TEXT")
    private String pros;
    
    @Column(columnDefinition = "TEXT")
    private String cons;
    
    private String complexity;
    private String implementationLibraries;
}
