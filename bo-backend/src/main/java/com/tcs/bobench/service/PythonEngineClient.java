package com.tcs.bobench.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PythonEngineClient {

    private final WebClient webClient;

    public PythonEngineClient(WebClient.Builder webClientBuilder, 
                              @Value("${python.engine.url:http://localhost:8000}") String engineUrl) {
        this.webClient = webClientBuilder.baseUrl(engineUrl).build();
    }

    public List<JsonNode> runBenchmark(String problemId, String testFunction, int nDimensions, int evaluationBudget, List<String> algorithms) {
        Map<String, Object> request = new HashMap<>();
        request.put("problem_id", problemId);
        request.put("test_function", testFunction != null ? testFunction : "ackley");
        request.put("n_dimensions", nDimensions > 0 ? nDimensions : 10);
        request.put("evaluation_budget", evaluationBudget > 0 ? evaluationBudget : 25);
        if (algorithms != null && !algorithms.isEmpty()) {
            request.put("algorithms_to_run", algorithms);
        }

        return webClient.post()
                .uri("/api/run-benchmark")
                .bodyValue(request)
                .retrieve()
                .bodyToFlux(JsonNode.class)
                .collectList()
                .block();
    }

    public JsonNode getRecommendation(int nDimensions, int evaluationBudget, Double boundsRange, Boolean isNoisy) {
        Map<String, Object> request = new HashMap<>();
        request.put("n_dimensions", nDimensions > 0 ? nDimensions : 10);
        request.put("evaluation_budget", evaluationBudget > 0 ? evaluationBudget : 50);
        request.put("bounds_range", boundsRange != null ? boundsRange : 20.0);
        request.put("is_noisy", isNoisy != null ? isNoisy : false);

        return webClient.post()
                .uri("/api/recommend")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode getMetaDatasetStats() {
        return webClient.get()
                .uri("/api/meta-dataset/stats")
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }
}
