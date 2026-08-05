package com.tcs.bobench.controller;

import com.tcs.bobench.dto.response.ApiResponse;
import com.tcs.bobench.entity.ChatMessage;
import com.tcs.bobench.entity.ChatSession;
import com.tcs.bobench.service.ChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final org.springframework.web.reactive.function.client.WebClient.Builder webClientBuilder;
    
    @org.springframework.beans.factory.annotation.Value("${llm.api.key}")
    private String apiKey;

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<ChatSession>>> getSessions(Authentication authentication) {
        List<ChatSession> sessions = chatService.getUserSessions(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<List<ChatSession>>builder()
                .status(200).message("Sessions fetched").data(sessions).timestamp(LocalDateTime.now()).build());
    }

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<ChatSession>> createSession(Authentication authentication, @RequestBody(required = false) SessionRequest request) {
        String title = request != null ? request.getTitle() : "New Conversation";
        ChatSession session = chatService.createSession(authentication.getName(), title);
        return ResponseEntity.ok(ApiResponse.<ChatSession>builder()
                .status(201).message("Session created").data(session).timestamp(LocalDateTime.now()).build());
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(Authentication authentication, @PathVariable Long id) {
        chatService.deleteSession(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200).message("Session deleted").timestamp(LocalDateTime.now()).build());
    }

    @PatchMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<ChatSession>> updateSession(Authentication authentication, @PathVariable Long id, @RequestBody SessionRequest request) {
        ChatSession session = chatService.updateSession(id, authentication.getName(), request.getTitle(), request.getPinned());
        return ResponseEntity.ok(ApiResponse.<ChatSession>builder()
                .status(200).message("Session updated").data(session).timestamp(LocalDateTime.now()).build());
    }

    @GetMapping("/sessions/{id}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getMessages(Authentication authentication, @PathVariable Long id) {
        List<ChatMessage> messages = chatService.getSessionMessages(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.<List<ChatMessage>>builder()
                .status(200).message("Messages fetched").data(messages).timestamp(LocalDateTime.now()).build());
    }

    @PostMapping(value = "/sessions/{id}/message", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> sendMessage(Authentication authentication, @PathVariable Long id, @RequestBody MessageRequest request) {
        return chatService.processMessage(id, authentication.getName(), request.getContent(), request.getPageContext());
    }

    @GetMapping("/test")
    public ResponseEntity<String> testAiConnection() {
        try {
            org.springframework.web.reactive.function.client.WebClient webClient = webClientBuilder.baseUrl("https://api.openai.com/v1").build();
            String response = webClient.post()
                    .uri("/chat/completions")
                    .header(org.springframework.http.HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(java.util.Map.of("model", "gpt-4o", "messages", java.util.List.of(java.util.Map.of("role", "user", "content", "Hello! Reply with 'Connected!'"))))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return ResponseEntity.ok(response);
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            return ResponseEntity.status(e.getStatusCode()).body("HTTP " + e.getStatusCode() + "\n\n" + e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @Data
    public static class SessionRequest {
        private String title;
        private Boolean pinned;
    }

    @Data
    public static class MessageRequest {
        private String content;
        private String pageContext;
    }
}
