package com.tcs.bobench.service;

import com.tcs.bobench.dto.request.LoginRequest;
import com.tcs.bobench.dto.request.RegisterRequest;
import com.tcs.bobench.dto.response.AuthResponse;
import com.tcs.bobench.dto.request.OtpVerifyRequest;
import com.tcs.bobench.dto.request.ResetPasswordRequest;
import com.tcs.bobench.entity.User;
import java.util.List;

public interface UserService {
    AuthResponse register(RegisterRequest request);
    AuthResponse verifyRegistrationOtp(OtpVerifyRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse googleLogin(String credential);

    void forgotPassword(String email);
    void verifyForgotPasswordOtp(OtpVerifyRequest request);
    void resetPassword(ResetPasswordRequest request);
    void resendOtp(String email, String purpose);

    User updateProfile(String email, RegisterRequest request);
    List<User> getAllUsers();
    void deleteUser(Long id);
    User getUserByEmail(String email);
}
