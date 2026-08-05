package com.tcs.bobench.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String profilePicture;
    private String institution;
    private String department;

    @Column(nullable = false)
    private String role; // ROLE_USER or ROLE_ADMIN

    @Column(nullable = false)
    private String accountStatus; // ACTIVE, INACTIVE, BANNED

    private String themePreference;
    private LocalDateTime lastLogin;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean emailVerified = true;

    @Column(nullable = false, columnDefinition = "varchar(255) default 'Free'")
    private String membershipType = "Free";

    private String bio;
    private String organization;

    @Column(nullable = false, columnDefinition = "int default 0")
    private int aiChatCount = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_research_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest")
    private List<String> researchInterests = new ArrayList<>();

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String updatedBy;
}
