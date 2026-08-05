package com.tcs.bobench.service;

import com.tcs.bobench.entity.ResearchNote;
import com.tcs.bobench.repository.ResearchNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ResearchNoteService {

    private final ResearchNoteRepository repository;

    public List<ResearchNote> findAll() {
        return repository.findAll();
    }

    public Optional<ResearchNote> findById(Long id) {
        return repository.findById(id);
    }

    public ResearchNote save(ResearchNote researchNote) {
        return repository.save(researchNote);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
