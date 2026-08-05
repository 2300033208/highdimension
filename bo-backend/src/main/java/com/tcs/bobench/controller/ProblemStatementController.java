package com.tcs.bobench.controller;

import com.tcs.bobench.dto.ProblemStatementRequest;
import com.tcs.bobench.dto.ProblemStatementResponse;
import com.tcs.bobench.service.ProblemStatementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/problem-statements")
public class ProblemStatementController {
    
    @Autowired
    private ProblemStatementService problemStatementService;

    @PostMapping
    public ResponseEntity<ProblemStatementResponse> createProblemStatement(
            @RequestBody ProblemStatementRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return new ResponseEntity<>(problemStatementService.createProblemStatement(request, userId), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProblemStatementResponse>> getUserProblemStatements(
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(problemStatementService.getUserProblemStatements(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProblemStatementResponse> getProblemStatementById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(problemStatementService.getProblemStatementById(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblemStatement(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        problemStatementService.deleteProblemStatement(id, userId);
        return ResponseEntity.noContent().build();
    }
}
