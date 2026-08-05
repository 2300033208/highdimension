package com.tcs.bobench.controller;

import com.tcs.bobench.dto.request.RegisterRequest;
import com.tcs.bobench.dto.response.ApiResponse;
import com.tcs.bobench.entity.User;
import com.tcs.bobench.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.<User>builder()
                .status(200)
                .message("Current user fetched successfully")
                .data(user)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(@RequestBody RegisterRequest request, Authentication authentication) {
        String email = authentication.getName();
        User updatedUser = userService.updateProfile(email, request);
        return ResponseEntity.ok(ApiResponse.<User>builder()
                .status(200)
                .message("Profile updated successfully")
                .data(updatedUser)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.<List<User>>builder()
                .status(200)
                .message("Users fetched successfully")
                .data(users)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .status(200)
                .message("User deleted successfully")
                .data(null)
                .timestamp(LocalDateTime.now())
                .build());
    }
}
