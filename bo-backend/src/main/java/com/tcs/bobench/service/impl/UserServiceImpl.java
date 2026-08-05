package com.tcs.bobench.service.impl;

import com.tcs.bobench.dto.request.LoginRequest;
import com.tcs.bobench.dto.request.RegisterRequest;
import com.tcs.bobench.dto.request.OtpVerifyRequest;
import com.tcs.bobench.dto.request.ResetPasswordRequest;
import com.tcs.bobench.dto.response.AuthResponse;
import com.tcs.bobench.entity.OtpPurpose;
import com.tcs.bobench.entity.OtpToken;
import com.tcs.bobench.entity.User;
import com.tcs.bobench.repository.OtpTokenRepository;
import com.tcs.bobench.repository.UserRepository;
import com.tcs.bobench.security.JwtUtil;
import com.tcs.bobench.service.EmailService;
import com.tcs.bobench.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;

    @Value("${app.google.client-id:657167911026-s0d4hjhb63tpbcecure7alugfqpshso0.apps.googleusercontent.com}")
    private String googleClientId;

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        // Create the user directly without OTP verification
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");
        user.setAccountStatus("ACTIVE");
        user.setMembershipType(request.getMembershipType() != null ? request.getMembershipType() : "Free");

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwt = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    @Override
    public AuthResponse verifyRegistrationOtp(OtpVerifyRequest request) {
        throw new RuntimeException("OTP verification is no longer required for registration. Please use the login endpoint.");
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    @Override
    public AuthResponse googleLogin(String credential) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null) {
                throw new RuntimeException("Invalid Google ID token.");
            }
            
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setName(name);
                newUser.setProfilePicture(pictureUrl);
                newUser.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString())); // dummy password
                newUser.setRole("ROLE_USER");
                newUser.setAccountStatus("ACTIVE");
                return newUser;
            });
            
            user.setLastLogin(LocalDateTime.now());
            if (pictureUrl != null && !pictureUrl.equals(user.getProfilePicture())) {
                user.setProfilePicture(pictureUrl); // update picture if changed
            }
            userRepository.save(user);

            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String token = jwtUtil.generateToken(userDetails);

            return AuthResponse.builder()
                    .token(token)
                    .type("Bearer")
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }

    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otpCode = generateOtp();
        
        otpTokenRepository.deleteByEmailAndPurpose(email, OtpPurpose.PASSWORD_RESET);

        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otpCode(otpCode)
                .purpose(OtpPurpose.PASSWORD_RESET)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .verified(false)
                .build();
                
        otpTokenRepository.save(otpToken);
        emailService.sendOtpEmail(user.getEmail(), user.getName(), otpCode, "PASSWORD_RESET");
    }

    @Override
    public void verifyForgotPasswordOtp(OtpVerifyRequest request) {
        OtpToken token = otpTokenRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(request.getEmail(), OtpPurpose.PASSWORD_RESET)
                .orElseThrow(() -> new RuntimeException("No password reset request found"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        if (!token.getOtpCode().equals(request.getOtpCode())) {
            throw new RuntimeException("Invalid OTP code");
        }

        token.setVerified(true);
        otpTokenRepository.save(token);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        OtpToken token = otpTokenRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(request.getEmail(), OtpPurpose.PASSWORD_RESET)
                .orElseThrow(() -> new RuntimeException("No password reset request found"));

        if (!token.isVerified() || !token.getOtpCode().equals(request.getOtpCode())) {
            throw new RuntimeException("OTP not verified");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpTokenRepository.delete(token);
    }

    @Override
    public void resendOtp(String email, String purposeStr) {
        OtpPurpose purpose = OtpPurpose.valueOf(purposeStr);
        
        OtpToken token = otpTokenRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(email, purpose)
                .orElseThrow(() -> new RuntimeException("No active session found for OTP resend"));
                
        if (token.getResendCount() >= 3) {
            throw new RuntimeException("Maximum OTP resend attempts reached. Please start over.");
        }
        
        // Prevent spamming (only allow resend after 60 seconds)
        if (token.getCreatedAt().plusSeconds(60).isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Please wait 60 seconds before requesting another OTP");
        }
        
        String newOtp = generateOtp();
        token.setOtpCode(newOtp);
        token.setCreatedAt(LocalDateTime.now());
        token.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        token.setResendCount(token.getResendCount() + 1);
        
        otpTokenRepository.save(token);
        emailService.sendOtpEmail(email, token.getPendingName(), newOtp, purpose.name());
    }

    @Override
    public User updateProfile(String email, RegisterRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
