package com.tcs.bobench.service;

import com.tcs.bobench.dto.request.LoginRequest;
import com.tcs.bobench.dto.request.OtpVerifyRequest;
import com.tcs.bobench.dto.request.RegisterRequest;
import com.tcs.bobench.dto.request.ResetPasswordRequest;
import com.tcs.bobench.dto.response.AuthResponse;
import com.tcs.bobench.entity.User;
import com.tcs.bobench.repository.OtpTokenRepository;
import com.tcs.bobench.repository.UserRepository;
import com.tcs.bobench.security.JwtUtil;
import com.tcs.bobench.service.EmailService;
import com.tcs.bobench.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpTokenRepository otpTokenRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserServiceImpl userService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setName("Test User");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        testUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("encoded_password")
                .role("ROLE_USER")
                .accountStatus("ACTIVE")
                .emailVerified(true)
                .createdAt(LocalDateTime.now())
                .lastLogin(LocalDateTime.now())
                .build();
    }

    @Test
    void register_shouldSaveOtpTokenAndSendEmail() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");

        // When
        userService.register(registerRequest);

        // Then
        verify(userRepository).existsByEmail("test@example.com");
        verify(passwordEncoder).encode("password123");
        verify(otpTokenRepository).save(any());
        verify(emailService).sendOtpEmail(anyString(), anyString(), anyString(), anyString());
        // User is NOT saved here - only OTP token is saved
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_shouldThrowException_whenEmailAlreadyExists() {
        // Given
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> userService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email is already in use");
    }

    @Test
    void login_shouldReturnAuthResponse_whenCredentialsValid() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(mock(UserDetails.class));
        when(jwtUtil.generateToken(any(UserDetails.class))).thenReturn("fake-jwt-token");

        // When
        AuthResponse response = userService.login(loginRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("fake-jwt-token");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getRole()).isEqualTo("ROLE_USER");
        verify(userRepository).findByEmail("test@example.com");
        verify(authenticationManager).authenticate(any());
        verify(jwtUtil).generateToken(any(UserDetails.class));
    }

    @Test
    void login_shouldThrowException_whenUserNotFound() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> userService.login(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void login_shouldThrowException_whenPasswordInvalid() {
        // Given
        when(authenticationManager.authenticate(any())).thenThrow(new RuntimeException("Bad credentials"));

        // When & Then
        assertThatThrownBy(() -> userService.login(loginRequest))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void verifyRegistrationOtp_shouldVerifyAndActivateUser() {
        // Given
        OtpVerifyRequest otpRequest = new OtpVerifyRequest();
        otpRequest.setEmail("test@example.com");
        otpRequest.setOtpCode("123456");

        // Mock OTP token
        com.tcs.bobench.entity.OtpToken otpToken = com.tcs.bobench.entity.OtpToken.builder()
                .email("test@example.com")
                .otpCode("123456")
                .purpose(com.tcs.bobench.entity.OtpPurpose.REGISTRATION)
                .pendingName("Test User")
                .pendingPassword("encoded_password")
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();

        when(otpTokenRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(anyString(), any()))
                .thenReturn(Optional.of(otpToken));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(mock(UserDetails.class));
        when(jwtUtil.generateToken(any(UserDetails.class))).thenReturn("fake-jwt-token");

        // When
        AuthResponse response = userService.verifyRegistrationOtp(otpRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("fake-jwt-token");
        verify(userRepository).save(any(User.class));
        verify(otpTokenRepository).delete(otpToken);
    }

    @Test
    void verifyRegistrationOtp_shouldThrowException_whenOtpInvalid() {
        // Given
        OtpVerifyRequest otpRequest = new OtpVerifyRequest();
        otpRequest.setEmail("test@example.com");
        otpRequest.setOtpCode("wrong_otp");

        com.tcs.bobench.entity.OtpToken otpToken = com.tcs.bobench.entity.OtpToken.builder()
                .email("test@example.com")
                .otpCode("123456")
                .purpose(com.tcs.bobench.entity.OtpPurpose.REGISTRATION)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();

        when(otpTokenRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(anyString(), any()))
                .thenReturn(Optional.of(otpToken));

        // When & Then
        assertThatThrownBy(() -> userService.verifyRegistrationOtp(otpRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid OTP");
    }

    @Test
    void forgotPassword_shouldGenerateOtpAndSendEmail() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // When
        userService.forgotPassword("test@example.com");

        // Then
        verify(otpTokenRepository).save(any());
        verify(emailService).sendOtpEmail(anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void resetPassword_shouldUpdatePassword_whenOtpValid() {
        // Given
        ResetPasswordRequest resetRequest = new ResetPasswordRequest();
        resetRequest.setEmail("test@example.com");
        resetRequest.setOtpCode("123456");
        resetRequest.setNewPassword("new_password123");

        com.tcs.bobench.entity.OtpToken otpToken = com.tcs.bobench.entity.OtpToken.builder()
                .email("test@example.com")
                .otpCode("123456")
                .purpose(com.tcs.bobench.entity.OtpPurpose.PASSWORD_RESET)
                .verified(true)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();

        when(otpTokenRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(anyString(), any()))
                .thenReturn(Optional.of(otpToken));
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("new_password123")).thenReturn("new_encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        userService.resetPassword(resetRequest);

        // Then
        verify(userRepository).save(argThat(user ->
                "new_encoded_password".equals(user.getPassword())
        ));
        verify(otpTokenRepository).delete(otpToken);
    }
}