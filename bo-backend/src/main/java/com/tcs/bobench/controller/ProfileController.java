package com.tcs.bobench.controller;

import com.tcs.bobench.dto.request.UpdateProfileRequest;
import com.tcs.bobench.dto.response.ApiResponse;
import com.tcs.bobench.dto.response.UserProfileResponse;
import com.tcs.bobench.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(Authentication authentication) {
        String email = authentication.getName();
        UserProfileResponse profile = profileService.getProfile(email);
        return ResponseEntity.ok(ApiResponse.<UserProfileResponse>builder()
                .status(200)
                .message("Profile fetched successfully")
                .data(profile)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(@RequestBody UpdateProfileRequest request, Authentication authentication) {
        String email = authentication.getName();
        UserProfileResponse updatedProfile = profileService.updateProfile(email, request);
        return ResponseEntity.ok(ApiResponse.<UserProfileResponse>builder()
                .status(200)
                .message("Profile updated successfully")
                .data(updatedProfile)
                .timestamp(LocalDateTime.now())
                .build());
    }
}
