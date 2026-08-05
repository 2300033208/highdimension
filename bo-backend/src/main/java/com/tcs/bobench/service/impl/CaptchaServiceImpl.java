package com.tcs.bobench.service.impl;

import com.tcs.bobench.dto.response.CaptchaResponse;
import com.tcs.bobench.service.CaptchaService;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CaptchaServiceImpl implements CaptchaService {

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars like I, O, 1, 0
    private static final int WIDTH = 200;
    private static final int HEIGHT = 60;
    private static final int CHAR_LENGTH = 6;
    
    // In-memory cache for CAPTCHAs. Key: captchaId, Value: { text, timestamp }
    private final ConcurrentHashMap<String, CaptchaData> captchaCache = new ConcurrentHashMap<>();
    
    // Rate limiting map. Key: IP address, Value: { failedAttempts, lockoutExpiry }
    private final ConcurrentHashMap<String, RateLimitData> rateLimitCache = new ConcurrentHashMap<>();
    
    private static class CaptchaData {
        String text;
        long createdAt;
        CaptchaData(String text, long createdAt) {
            this.text = text;
            this.createdAt = createdAt;
        }
    }
    
    private static class RateLimitData {
        int failedAttempts;
        long lockoutExpiry;
    }

    @Override
    public CaptchaResponse generateCaptcha(String ipAddress) {
        checkRateLimit(ipAddress);
        cleanupExpiredCaptchas();
        
        String captchaText = generateRandomText();
        String captchaId = UUID.randomUUID().toString();
        
        captchaCache.put(captchaId, new CaptchaData(captchaText, System.currentTimeMillis()));
        
        String base64Image = generateCaptchaImageBase64(captchaText);
        
        return CaptchaResponse.builder()
                .captchaId(captchaId)
                .image(base64Image)
                .build();
    }

    @Override
    public void validateCaptcha(String captchaId, String captchaAnswer, String ipAddress) {
        checkRateLimit(ipAddress);
        
        if (captchaId == null || captchaAnswer == null) {
            recordFailedAttempt(ipAddress);
            throw new RuntimeException("CAPTCHA cannot be empty.");
        }
        
        CaptchaData data = captchaCache.remove(captchaId); // Immediately invalidate to prevent replay
        
        if (data == null) {
            recordFailedAttempt(ipAddress);
            throw new RuntimeException("CAPTCHA expired or invalid. Please refresh.");
        }
        
        // TTL 5 minutes
        if (System.currentTimeMillis() - data.createdAt > 5 * 60 * 1000) {
            recordFailedAttempt(ipAddress);
            throw new RuntimeException("CAPTCHA expired. Please refresh.");
        }
        
        if (!data.text.equalsIgnoreCase(captchaAnswer.trim())) {
            recordFailedAttempt(ipAddress);
            throw new RuntimeException("CAPTCHA is incorrect.");
        }
        
        // Success: clear failed attempts for this IP
        rateLimitCache.remove(ipAddress);
    }
    
    private void checkRateLimit(String ipAddress) {
        RateLimitData data = rateLimitCache.get(ipAddress);
        if (data != null) {
            if (data.lockoutExpiry > System.currentTimeMillis()) {
                long remainingSeconds = (data.lockoutExpiry - System.currentTimeMillis()) / 1000;
                throw new RuntimeException("Too many failed attempts. Try again in " + remainingSeconds + " seconds.");
            } else if (data.lockoutExpiry > 0) {
                // Lockout expired, reset
                rateLimitCache.remove(ipAddress);
            }
        }
    }
    
    private void recordFailedAttempt(String ipAddress) {
        RateLimitData data = rateLimitCache.computeIfAbsent(ipAddress, k -> new RateLimitData());
        data.failedAttempts++;
        if (data.failedAttempts >= 5) {
            data.lockoutExpiry = System.currentTimeMillis() + 60 * 1000; // 60 seconds lockout
        }
    }
    
    private void cleanupExpiredCaptchas() {
        long now = System.currentTimeMillis();
        // Remove captchas older than 5 minutes
        captchaCache.entrySet().removeIf(entry -> now - entry.getValue().createdAt > 5 * 60 * 1000);
    }
    
    private String generateRandomText() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < CHAR_LENGTH; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
    
    private String generateCaptchaImageBase64(String text) {
        BufferedImage image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        Random random = new Random();
        
        // Dark background #0F172A
        g.setColor(new Color(15, 23, 42));
        g.fillRect(0, 0, WIDTH, HEIGHT);
        
        // Add interference lines
        for (int i = 0; i < 8; i++) {
            int x1 = random.nextInt(WIDTH);
            int y1 = random.nextInt(HEIGHT);
            int x2 = random.nextInt(WIDTH);
            int y2 = random.nextInt(HEIGHT);
            // Random dark-ish colors for lines
            g.setColor(new Color(random.nextInt(100) + 50, random.nextInt(100) + 50, random.nextInt(100) + 50));
            g.drawLine(x1, y1, x2, y2);
        }
        
        // Add noise dots
        for (int i = 0; i < 100; i++) {
            int x = random.nextInt(WIDTH);
            int y = random.nextInt(HEIGHT);
            g.setColor(new Color(random.nextInt(255), random.nextInt(255), random.nextInt(255)));
            g.fillRect(x, y, 1, 1);
        }
        
        // Draw characters
        Font[] fonts = {
                new Font("Arial", Font.BOLD | Font.ITALIC, 32),
                new Font("Verdana", Font.BOLD, 30),
                new Font("Courier New", Font.BOLD | Font.ITALIC, 34)
        };
        
        int startX = 20;
        for (int i = 0; i < text.length(); i++) {
            g.setFont(fonts[random.nextInt(fonts.length)]);
            
            // Random bright/accent colors matching HD-BO Bench theme (whites, blues, cyans)
            int r = random.nextInt(100) + 155;
            int b = random.nextInt(100) + 155;
            g.setColor(new Color(r, 200, b));
            
            // Random rotation between -20 and 20 degrees
            double angle = (random.nextInt(40) - 20) * Math.PI / 180;
            g.rotate(angle, startX, HEIGHT / 2.0);
            
            // Random Y offset
            int yOffset = random.nextInt(10) - 5;
            g.drawString(String.valueOf(text.charAt(i)), startX, (HEIGHT / 2) + 10 + yOffset);
            
            // Reset rotation
            g.rotate(-angle, startX, HEIGHT / 2.0);
            
            startX += random.nextInt(5) + 25; // Random spacing
        }
        
        g.dispose();
        
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CAPTCHA image", e);
        }
    }
}
