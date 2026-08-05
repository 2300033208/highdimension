package com.tcs.bobench.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String otpCode;

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String newPassword;
}
