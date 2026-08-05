package com.tcs.bobench.service;

import com.tcs.bobench.entity.Report;
import com.tcs.bobench.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository repository;

    public List<Report> findAll() {
        return repository.findAll();
    }

    public Optional<Report> findById(Long id) {
        return repository.findById(id);
    }

    public Report save(Report report) {
        if (report.getGeneratedAt() == null) {
            report.setGeneratedAt(LocalDateTime.now());
        }
        return repository.save(report);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
