package com.tcs.bobench.service;

import com.tcs.bobench.dto.request.UpdateProfileRequest;
import com.tcs.bobench.dto.response.UserProfileResponse;

public interface ProfileService {
    UserProfileResponse getProfile(String email);
    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
}
