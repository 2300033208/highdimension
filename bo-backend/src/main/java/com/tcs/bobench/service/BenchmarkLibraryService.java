package com.tcs.bobench.service;

import com.tcs.bobench.entity.BenchmarkLibrary;
import com.tcs.bobench.repository.BenchmarkLibraryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BenchmarkLibraryService {

    private final BenchmarkLibraryRepository repository;

    public List<BenchmarkLibrary> findAll() {
        return repository.findAll();
    }

    public Optional<BenchmarkLibrary> findById(Long id) {
        return repository.findById(id);
    }

    public BenchmarkLibrary save(BenchmarkLibrary benchmarkLibrary) {
        return repository.save(benchmarkLibrary);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
