package com.tcs.bobench.repository;

import com.tcs.bobench.entity.BenchmarkResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BenchmarkResultRepository extends JpaRepository<BenchmarkResult, Long> {
    List<BenchmarkResult> findByExperimentId(Long experimentId);
}
