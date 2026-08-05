package com.tcs.bobench.controller;

import com.tcs.bobench.entity.ResearchNote;
import com.tcs.bobench.service.ResearchNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/research-notes")
@RequiredArgsConstructor
public class ResearchNoteController {

    private final ResearchNoteService service;

    @GetMapping
    public ResponseEntity<List<ResearchNote>> getAllResearchNotes() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResearchNote> getResearchNoteById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ResearchNote> createResearchNote(@RequestBody ResearchNote researchNote) {
        return ResponseEntity.ok(service.save(researchNote));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResearchNote> updateResearchNote(@PathVariable Long id, @RequestBody ResearchNote researchNote) {
        if (!service.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        researchNote.setId(id);
        return ResponseEntity.ok(service.save(researchNote));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResearchNote(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
