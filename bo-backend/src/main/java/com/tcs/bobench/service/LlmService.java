package com.tcs.bobench.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;
import jakarta.annotation.PostConstruct;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
@Slf4j
public class LlmService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${llm.api.key}")
    private String apiKey;

    @Value("${llm.api.model:llama3.1}")
    private String model;

    @Value("${llm.api.base-url:http://localhost:11434/v1}")
    private String baseUrl;

    public LlmService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper,
                       @Value("${llm.api.base-url:http://localhost:11434/v1}") String baseUrl) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void validateConfig() {
        log.info("LLM Service configured — Base URL: {}, Model: {}", baseUrl, model);
        if (baseUrl.contains("localhost:11434")) {
            log.info("Using Ollama (local LLM). Make sure Ollama is running with model '{}' pulled.", model);
        }
    }

    public Flux<String> streamChatCompletion(List<Map<String, String>> messages) {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", messages,
                "stream", true
        );

        log.debug("Sending chat completion request to {} using model '{}' for {} messages", baseUrl, model, messages.size());

        return webClient.post()
                .uri("/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.is4xxClientError(), response -> {
                    return response.bodyToMono(String.class).map(body -> {
                        log.error("LLM API 4xx Error: HTTP {} - Body: {}", response.statusCode(), body);
                        if (response.statusCode().value() == 401) {
                            return new RuntimeException("Invalid API Key. Please configure a valid API Key.");
                        } else if (response.statusCode().value() == 429) {
                            return new RuntimeException("Rate limit exceeded or insufficient quota.");
                        } else if (response.statusCode().value() == 404) {
                            return new RuntimeException("The requested AI model '" + model + "' is not available. Run: ollama pull " + model);
                        }
                        return new RuntimeException("LLM API Client Error: " + response.statusCode());
                    });
                })
                .onStatus(status -> status.is5xxServerError(), response -> {
                    return response.bodyToMono(String.class).map(body -> {
                        log.error("LLM API 5xx Error: HTTP {} - Body: {}", response.statusCode(), body);
                        return new RuntimeException("The LLM server is currently experiencing issues. Make sure Ollama is running.");
                    });
                })
                .bodyToFlux(String.class)
                .filter(chunk -> !chunk.equals("[DONE]"))
                .map(this::extractContentFromChunk)
                .filter(content -> !content.isEmpty())
                .onErrorResume(e -> {
                    log.error("Exception in LlmService stream: ", e);
                    return Flux.just("❌ **System Error**: " + e.getMessage());
                });
    }

    private String extractContentFromChunk(String chunk) {
        try {
            JsonNode root = objectMapper.readTree(chunk);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                JsonNode delta = choices.get(0).path("delta");
                if (delta.has("content")) {
                    return delta.get("content").asText();
                }
            }
        } catch (Exception e) {
            log.trace("Could not parse chunk: {}", chunk);
        }
        return "";
    }
}
