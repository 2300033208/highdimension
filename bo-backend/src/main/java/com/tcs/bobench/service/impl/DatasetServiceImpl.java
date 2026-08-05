package com.tcs.bobench.service.impl;

import com.tcs.bobench.dto.DatasetRequest;
import com.tcs.bobench.dto.DatasetResponse;
import com.tcs.bobench.entity.Dataset;
import com.tcs.bobench.entity.User;
import com.tcs.bobench.repository.DatasetRepository;
import com.tcs.bobench.service.DatasetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DatasetServiceImpl implements DatasetService {
    @Autowired private DatasetRepository datasetRepository;
    @Autowired private EntityManager entityManager;

    @Override
    public DatasetResponse createDataset(DatasetRequest request, Long userId) {
        Dataset dataset = new Dataset();
        dataset.setName(request.getName());
        dataset.setPath(request.getPath());
        dataset.setRows(request.getRows());
        dataset.setColumns(request.getColumns());
        dataset.setTarget(request.getTarget());
        dataset.setOwner(entityManager.getReference(User.class, userId));
        
        Dataset saved = datasetRepository.save(dataset);
        return mapToResponse(saved);
    }

    @Override
    public List<DatasetResponse> getUserDatasets(Long userId) {
        return datasetRepository.findByOwnerId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DatasetResponse getDatasetById(Long id, Long userId) {
        Dataset dataset = datasetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));
        if (!dataset.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return mapToResponse(dataset);
    }

    @Override
    public void deleteDataset(Long id, Long userId) {
        Dataset dataset = datasetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));
        if (!dataset.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        datasetRepository.delete(dataset);
    }

    private DatasetResponse mapToResponse(Dataset dataset) {
        DatasetResponse response = new DatasetResponse();
        response.setId(dataset.getId());
        response.setName(dataset.getName());
        response.setPath(dataset.getPath());
        response.setOwnerId(dataset.getOwner().getId());
        response.setRows(dataset.getRows());
        response.setColumns(dataset.getColumns());
        response.setTarget(dataset.getTarget());
        response.setCreatedAt(dataset.getCreatedAt());
        return response;
    }
}
