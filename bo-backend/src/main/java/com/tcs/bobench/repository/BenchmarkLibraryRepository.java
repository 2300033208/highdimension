package com.tcs.bobench.repository;

import com.tcs.bobench.entity.BenchmarkLibrary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BenchmarkLibraryRepository extends JpaRepository<BenchmarkLibrary, Long> {
}
