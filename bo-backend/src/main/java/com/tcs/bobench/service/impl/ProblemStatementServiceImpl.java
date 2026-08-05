package com.tcs.bobench.service.impl;

import com.tcs.bobench.dto.ProblemStatementRequest;
import com.tcs.bobench.dto.ProblemStatementResponse;
import com.tcs.bobench.entity.ProblemStatement;
import com.tcs.bobench.entity.User;
import com.tcs.bobench.repository.ProblemStatementRepository;
import com.tcs.bobench.service.ProblemStatementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProblemStatementServiceImpl implements ProblemStatementService {
    @Autowired private ProblemStatementRepository problemStatementRepository;
    @Autowired private EntityManager entityManager;

    @Override
    public ProblemStatementResponse createProblemStatement(ProblemStatementRequest request, Long userId) {
        ProblemStatement ps = new ProblemStatement();
        ps.setTitle(request.getTitle());
        ps.setDescription(request.getDescription());
        ps.setObjective(request.getObjective());
        ps.setConstraints(request.getConstraints());
        ps.setStatus(request.getStatus());
        ps.setOwner(entityManager.getReference(User.class, userId));
        
        ProblemStatement saved = problemStatementRepository.save(ps);
        return mapToResponse(saved);
    }

    @Override
    public List<ProblemStatementResponse> getUserProblemStatements(Long userId) {
        return problemStatementRepository.findByOwnerId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProblemStatementResponse getProblemStatementById(Long id, Long userId) {
        ProblemStatement ps = problemStatementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProblemStatement not found"));
        if (!ps.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return mapToResponse(ps);
    }

    @Override
    public void deleteProblemStatement(Long id, Long userId) {
        ProblemStatement ps = problemStatementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProblemStatement not found"));
        if (!ps.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        problemStatementRepository.delete(ps);
    }

    private ProblemStatementResponse mapToResponse(ProblemStatement ps) {
        ProblemStatementResponse response = new ProblemStatementResponse();
        response.setId(ps.getId());
        response.setTitle(ps.getTitle());
        response.setDescription(ps.getDescription());
        response.setObjective(ps.getObjective());
        response.setConstraints(ps.getConstraints());
        response.setStatus(ps.getStatus());
        response.setOwnerId(ps.getOwner().getId());
        response.setCreatedAt(ps.getCreatedAt());
        return response;
    }
}
