package com.tcs.bobench.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "documentation")
public class Documentation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String section;
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
}
