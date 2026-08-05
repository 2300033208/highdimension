package com.tcs.bobench.service;

import com.tcs.bobench.entity.ChatMessage;
import com.tcs.bobench.entity.ChatSession;
import com.tcs.bobench.entity.User;
import com.tcs.bobench.repository.ChatMessageRepository;
import com.tcs.bobench.repository.ChatSessionRepository;
import com.tcs.bobench.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final LlmService llmService;

    private static final String SYSTEM_PROMPT = """
            You are the AI Chat Assistant for the 'High-Dimensional Bayesian Optimisation Benchmark and Algorithm-Selection Platform'.
            You are helpful, concise, and highly knowledgeable about Bayesian Optimization (Vanilla BO, SAASBO, TuRBO, BAxUS, HEBO, Optuna),
            Machine Learning, Data Science, and Mathematics.
            
            IMPORTANT ARCHITECTURAL ROLE:
            - The actual Bayesian Optimization experiments are executed by the Python optimization engine.
            - Algorithm recommendations are predicted by a dedicated Machine Learning model (Random Forest trained on empirical benchmark meta-datasets).
            - You act as the conversational, explanatory layer. Your purpose is to explain WHY the ML model made a recommendation, interpret convergence curves and regret values, clarify trade-offs between algorithms (e.g. TuRBO for local trust regions, SAASBO for sparse active dimensions, BAxUS for adaptive target dimensionality, HEBO for heteroscedastic noise), and guide the user through the benchmarking workflow.
            - You do NOT fabricate benchmark numbers or pretend to run the optimization yourself; refer the user to the Recommendation and Experiment pages for the real data-driven results.
            
            Use Markdown formatting for your responses, especially for code blocks (with language specified) and mathematical formulas (using LaTeX).
            """;

    @Transactional(readOnly = true)
    public List<ChatSession> getUserSessions(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return chatSessionRepository.findByUserOrderByUpdatedAtDesc(user);
    }

    @Transactional
    public ChatSession createSession(String email, String title) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        ChatSession session = ChatSession.builder()
                .user(user)
                .title(title != null ? title : "New Conversation")
                .pinned(false)
                .build();
        return chatSessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> getSessionMessages(Long sessionId, String email) {
        ChatSession session = validateSessionOwnership(sessionId, email);
        return chatMessageRepository.findBySessionOrderByCreatedAtAsc(session);
    }

    @Transactional
    public void deleteSession(Long sessionId, String email) {
        ChatSession session = validateSessionOwnership(sessionId, email);
        chatSessionRepository.delete(session);
    }

    @Transactional
    public ChatSession updateSession(Long sessionId, String email, String title, Boolean pinned) {
        ChatSession session = validateSessionOwnership(sessionId, email);
        if (title != null) session.setTitle(title);
        if (pinned != null) session.setPinned(pinned);
        return chatSessionRepository.save(session);
    }

    @Transactional
    public Flux<String> processMessage(Long sessionId, String email, String content, String pageContext) {
        ChatSession session = validateSessionOwnership(sessionId, email);

        log.info("=================================================");
        log.info("AI Request Triggered!");
        log.info("User Email: {}", email);
        log.info("Chat Session ID: {}", sessionId);
        log.info("Selected Model: gpt-4o (or fallback)");
        log.info("API Endpoint: /api/v1/chat/sessions/{}/message", sessionId);
        log.info("Page Context: {}", pageContext);
        log.info("Incoming User Message: {}", content);
        log.info("=================================================");

        // Save User Message
        ChatMessage userMessage = ChatMessage.builder()
                .session(session)
                .role("USER")
                .content(content)
                .pageContext(pageContext)
                .build();
        chatMessageRepository.save(userMessage);

        // Build History for LLM
        List<ChatMessage> history = chatMessageRepository.findBySessionOrderByCreatedAtAsc(session);
        List<Map<String, String>> llmMessages = new ArrayList<>();
        
        // System Prompt with dynamic Context Awareness
        String dynamicSystemPrompt = SYSTEM_PROMPT;
        if (pageContext != null && !pageContext.isEmpty()) {
            dynamicSystemPrompt += "\nThe user is currently viewing the following page/context: " + pageContext + ". Provide contextual assistance based on this.";
        }
        llmMessages.add(Map.of("role", "system", "content", dynamicSystemPrompt));

        // Add history
        for (ChatMessage msg : history) {
            String role = msg.getRole().equals("USER") ? "user" : "assistant";
            llmMessages.add(Map.of("role", role, "content", msg.getContent()));
        }

        // Prepare StringBuilder to capture full AI response
        StringBuilder aiResponseBuilder = new StringBuilder();

        // Stream and Capture
        return llmService.streamChatCompletion(llmMessages)
                .doOnNext(aiResponseBuilder::append)
                .doOnComplete(() -> {
                    // Save complete AI message
                    ChatMessage aiMessage = ChatMessage.builder()
                            .session(session)
                            .role("AI")
                            .content(aiResponseBuilder.toString())
                            .build();
                    chatMessageRepository.save(aiMessage);
                    
                    // Auto-generate title if this is the first message interaction
                    if (history.size() <= 1 && session.getTitle().equals("New Conversation")) {
                        generateTitleForSession(session, content);
                    }
                });
    }

    private void generateTitleForSession(ChatSession session, String firstMessage) {
        // Very brief synchronous call or fire-and-forget to generate a title
        // For simplicity, we just take the first few words of the user message.
        String newTitle = firstMessage.length() > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage;
        session.setTitle(newTitle);
        chatSessionRepository.save(session);
    }

    private ChatSession validateSessionOwnership(Long sessionId, String email) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        if (!session.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized access to chat session");
        }
        return session;
    }
}
