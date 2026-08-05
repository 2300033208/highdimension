package com.tcs.bobench.controller;

import com.tcs.bobench.entity.AlgorithmInfo;
import com.tcs.bobench.service.AlgorithmInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/algorithms")
@RequiredArgsConstructor
public class AlgorithmInfoController {

    private final AlgorithmInfoService service;

    @GetMapping
    public ResponseEntity<List<AlgorithmInfo>> getAllAlgorithms() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlgorithmInfo> getAlgorithmById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AlgorithmInfo> createAlgorithm(@RequestBody AlgorithmInfo algorithmInfo) {
        return ResponseEntity.ok(service.save(algorithmInfo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlgorithmInfo> updateAlgorithm(@PathVariable Long id, @RequestBody AlgorithmInfo algorithmInfo) {
        if (!service.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        algorithmInfo.setId(id);
        return ResponseEntity.ok(service.save(algorithmInfo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlgorithm(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
