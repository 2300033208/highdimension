package com.tcs.bobench.repository;

import com.tcs.bobench.entity.AlgorithmInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlgorithmInfoRepository extends JpaRepository<AlgorithmInfo, Long> {
}
