package com.tcs.bobench.service;

import com.tcs.bobench.entity.Documentation;
import com.tcs.bobench.repository.DocumentationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DocumentationService {

    private final DocumentationRepository repository;

    public List<Documentation> findAll() {
        return repository.findAll();
    }

    public Optional<Documentation> findById(Long id) {
        return repository.findById(id);
    }

    public Documentation save(Documentation documentation) {
        return repository.save(documentation);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
