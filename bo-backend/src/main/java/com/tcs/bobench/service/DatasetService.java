package com.tcs.bobench.service;

import com.tcs.bobench.dto.DatasetRequest;
import com.tcs.bobench.dto.DatasetResponse;
import java.util.List;

public interface DatasetService {
    DatasetResponse createDataset(DatasetRequest request, Long userId);
    List<DatasetResponse> getUserDatasets(Long userId);
    DatasetResponse getDatasetById(Long id, Long userId);
    void deleteDataset(Long id, Long userId);
}
