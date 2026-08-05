package com.tcs.bobench.repository;

import com.tcs.bobench.entity.ProblemStatement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemStatementRepository extends JpaRepository<ProblemStatement, Long> {
    List<ProblemStatement> findByOwnerId(Long ownerId);
}
