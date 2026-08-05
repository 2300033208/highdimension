package com.tcs.bobench.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String name, String otpCode, String purpose);
}
