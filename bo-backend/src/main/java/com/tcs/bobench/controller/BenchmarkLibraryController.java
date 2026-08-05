package com.tcs.bobench.controller;

import com.tcs.bobench.entity.BenchmarkLibrary;
import com.tcs.bobench.service.BenchmarkLibraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/benchmarks")
@RequiredArgsConstructor
public class BenchmarkLibraryController {

    private final BenchmarkLibraryService service;

    @GetMapping
    public ResponseEntity<List<BenchmarkLibrary>> getAllBenchmarks() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BenchmarkLibrary> getBenchmarkById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<BenchmarkLibrary> createBenchmark(@RequestBody BenchmarkLibrary benchmarkLibrary) {
        return ResponseEntity.ok(service.save(benchmarkLibrary));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BenchmarkLibrary> updateBenchmark(@PathVariable Long id, @RequestBody BenchmarkLibrary benchmarkLibrary) {
        if (!service.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        benchmarkLibrary.setId(id);
        return ResponseEntity.ok(service.save(benchmarkLibrary));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBenchmark(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
