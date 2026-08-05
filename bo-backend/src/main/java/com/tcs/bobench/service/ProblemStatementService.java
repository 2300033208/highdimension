package com.tcs.bobench.service;

import com.tcs.bobench.dto.ProblemStatementRequest;
import com.tcs.bobench.dto.ProblemStatementResponse;
import java.util.List;

public interface ProblemStatementService {
    ProblemStatementResponse createProblemStatement(ProblemStatementRequest request, Long userId);
    List<ProblemStatementResponse> getUserProblemStatements(Long userId);
    ProblemStatementResponse getProblemStatementById(Long id, Long userId);
    void deleteProblemStatement(Long id, Long userId);
}
