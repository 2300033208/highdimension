package com.tcs.bobench.controller;

import com.tcs.bobench.dto.request.LoginRequest;
import com.tcs.bobench.dto.request.RegisterRequest;
import com.tcs.bobench.dto.response.ApiResponse;
import com.tcs.bobench.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;

    @Test
    void register_shouldReturnAuthResponse() {
        // Given
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setName("Test User");
        request.setPassword("password123");

        com.tcs.bobench.dto.response.AuthResponse authResponse = new com.tcs.bobench.dto.response.AuthResponse();
        authResponse.setToken("fake-jwt-token");
        authResponse.setEmail("test@example.com");
        authResponse.setName("Test User");

        when(userService.register(request)).thenReturn(authResponse);

        // When
        ResponseEntity<ApiResponse<com.tcs.bobench.dto.response.AuthResponse>> response = authController.register(request);

        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(200);
        assertThat(response.getBody().getMessage()).isEqualTo("Registration successful");
        assertThat(response.getBody().getData().getToken()).isEqualTo("fake-jwt-token");
        verify(userService).register(request);
    }

    @Test
    void login_shouldReturnAuthResponse() {
        // Given
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        com.tcs.bobench.dto.response.AuthResponse authResponse = new com.tcs.bobench.dto.response.AuthResponse();
        authResponse.setToken("fake-jwt-token");

        when(userService.login(request)).thenReturn(authResponse);

        // When
        ResponseEntity<ApiResponse<com.tcs.bobench.dto.response.AuthResponse>> response = authController.login(request);

        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(200);
        assertThat(response.getBody().getMessage()).isEqualTo("User logged in successfully");
        assertThat(response.getBody().getData().getToken()).isEqualTo("fake-jwt-token");
        verify(userService).login(request);
    }

    @Test
    void googleLogin_shouldReturnAuthResponse() {
        // Given
        String credential = "google-credential-token";
        com.tcs.bobench.dto.response.AuthResponse authResponse = new com.tcs.bobench.dto.response.AuthResponse();
        authResponse.setToken("fake-jwt-token");

        when(userService.googleLogin(credential)).thenReturn(authResponse);

        // When
        ResponseEntity<ApiResponse<com.tcs.bobench.dto.response.AuthResponse>> response = authController.googleLogin(
                new com.tcs.bobench.dto.request.GoogleLoginRequest(credential)
        );

        // Then
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(200);
        assertThat(response.getBody().getMessage()).isEqualTo("Google Login successful");
        assertThat(response.getBody().getData().getToken()).isEqualTo("fake-jwt-token");
        verify(userService).googleLogin(credential);
    }
}