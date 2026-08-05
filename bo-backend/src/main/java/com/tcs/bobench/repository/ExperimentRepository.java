package com.tcs.bobench.repository;

import com.tcs.bobench.entity.Experiment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperimentRepository extends JpaRepository<Experiment, Long> {
    List<Experiment> findByUserId(Long userId);
}
