package com.tcs.bobench.controller;

import com.tcs.bobench.entity.Documentation;
import com.tcs.bobench.service.DocumentationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documentation")
@RequiredArgsConstructor
public class DocumentationController {

    private final DocumentationService service;

    @GetMapping
    public ResponseEntity<List<Documentation>> getAllDocumentation() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Documentation> getDocumentationById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Documentation> createDocumentation(@RequestBody Documentation documentation) {
        return ResponseEntity.ok(service.save(documentation));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Documentation> updateDocumentation(@PathVariable Long id, @RequestBody Documentation documentation) {
        if (!service.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        documentation.setId(id);
        return ResponseEntity.ok(service.save(documentation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocumentation(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
