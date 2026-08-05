package com.tcs.bobench.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String format;
    private String filePath;
    private Long experimentId;
    private LocalDateTime generatedAt;
}
