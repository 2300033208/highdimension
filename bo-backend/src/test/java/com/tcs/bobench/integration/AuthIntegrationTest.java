package com.tcs.bobench.integration;

import com.tcs.bobench.dto.request.LoginRequest;
import com.tcs.bobench.dto.request.RegisterRequest;
import com.tcs.bobench.entity.User;
import com.tcs.bobench.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class AuthIntegrationTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("bobench_test")
            .withUsername("testuser")
            .withPassword("testpass");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("app.jwt.secret", () -> "test_secret_key_for_testing_only_at_least_32_bytes_long");
        registry.add("spring.mail.username", () -> "test@test.com");
        registry.add("spring.mail.password", () -> "testpass");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void register_shouldCreateUserAndReturnSuccess() throws Exception {
        String json = """
            {
                "name": "Integration Test User",
                "institution": "Test Institution",
                "email": "integration@test.com",
                "password": "password123",
                "membershipType": "Free"
            }
            """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("OTP sent to your email"));
    }

    @Test
    void login_shouldReturnToken_whenUserExistsAndPasswordCorrect() throws Exception {
        // Given: Create a verified user with properly BCrypt-encoded password for "password123"
        User user = User.builder()
                .name("Test User")
                .institution("Test Inst")
                .email("login@test.com")
                .password(passwordEncoder.encode("password123"))
                .role("ROLE_USER")
                .accountStatus("ACTIVE")
                .emailVerified(true)
                .membershipType("Free")
                .build();
        userRepository.save(user);

        String json = """
            {
                "email": "login@test.com",
                "password": "password123"
            }
            """;

        // When & Then: This will fail without proper password encoding setup
        // This is a placeholder for the full integration test
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk());
    }
}