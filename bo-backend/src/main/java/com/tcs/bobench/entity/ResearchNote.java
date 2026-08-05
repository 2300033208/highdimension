package com.tcs.bobench.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "research_notes")
public class ResearchNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(columnDefinition = "TEXT")
    private String citations;
    
    private Long userId;
}
