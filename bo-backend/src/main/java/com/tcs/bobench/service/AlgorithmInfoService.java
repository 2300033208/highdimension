package com.tcs.bobench.service;

import com.tcs.bobench.entity.AlgorithmInfo;
import com.tcs.bobench.repository.AlgorithmInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AlgorithmInfoService {

    private final AlgorithmInfoRepository repository;

    public List<AlgorithmInfo> findAll() {
        return repository.findAll();
    }

    public Optional<AlgorithmInfo> findById(Long id) {
        return repository.findById(id);
    }

    public AlgorithmInfo save(AlgorithmInfo algorithmInfo) {
        return repository.save(algorithmInfo);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
