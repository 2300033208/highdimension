package com.tcs.bobench.controller;

import com.tcs.bobench.dto.request.ForgotPasswordRequest;
import com.tcs.bobench.dto.request.GoogleLoginRequest;
import com.tcs.bobench.dto.request.LoginRequest;
import com.tcs.bobench.dto.request.OtpVerifyRequest;
import com.tcs.bobench.dto.request.RegisterRequest;
import com.tcs.bobench.dto.request.ResetPasswordRequest;
import com.tcs.bobench.dto.response.ApiResponse;
import com.tcs.bobench.dto.response.AuthResponse;
import com.tcs.bobench.dto.response.CaptchaResponse;
import com.tcs.bobench.service.CaptchaService;
import com.tcs.bobench.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final CaptchaService captchaService;

    @GetMapping("/captcha")
    public ResponseEntity<ApiResponse<CaptchaResponse>> getCaptcha(HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();
        CaptchaResponse response = captchaService.generateCaptcha(clientIp);
        return ResponseEntity.ok(ApiResponse.<CaptchaResponse>builder()
                .status(200)
                .message("Captcha generated successfully")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = userService.register(request);
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .status(200)
                .message("Registration successful")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PostMapping("/verify-registration-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyRegistrationOtp(@RequestBody @Valid OtpVerifyRequest request) {
        AuthResponse response = userService.verifyRegistrationOtp(request);
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .status(200)
                .message("OTP verification is no longer required for registration. Please use the login endpoint.")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .status(200)
                .message("User logged in successfully")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@RequestBody GoogleLoginRequest request) {
        AuthResponse response = userService.googleLogin(request.getCredential());
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .status(200)
                .message("Google Login successful")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@RequestBody Map<String, String> request) {
        userService.resendOtp(request.get("email"), request.get("purpose"));
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("OTP resent successfully")
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Password reset OTP sent to your email")
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PostMapping("/verify-forgot-password-otp")
    public ResponseEntity<ApiResponse<Void>> verifyForgotPasswordOtp(@Valid @RequestBody OtpVerifyRequest request) {
        userService.verifyForgotPasswordOtp(request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("OTP verified. Proceed to reset password.")
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Password reset successfully")
                .timestamp(LocalDateTime.now())
                .build());
    }
}
