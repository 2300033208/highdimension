package com.tcs.bobench.service.impl;

import com.tcs.bobench.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    @Override
    @Async
    public void sendOtpEmail(String toEmail, String name, String otpCode, String purpose) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(toEmail);
            helper.setFrom("HD-BO Bench Security Team <noreply@hdbobench.com>");
            
            Context context = new Context();
            context.setVariable("name", name != null ? name : "User");
            context.setVariable("otpCode", otpCode);
            
            String template = purpose.equals("REGISTRATION") ? "registration-otp" : "password-reset-otp";
            String subject = purpose.equals("REGISTRATION") 
                ? "Verify Your Email - HD-BO Bench OTP" 
                : "Reset Your Password - HD-BO Bench OTP";
            
            helper.setSubject(subject);
            
            String htmlContent = templateEngine.process(template, context);
            helper.setText(htmlContent, true);
            
            javaMailSender.send(message);
            log.info("Sent {} OTP email to {}", purpose, toEmail);
            
        } catch (MessagingException e) {
            log.error("Failed to send OTP email to {}", toEmail, e);
            throw new RuntimeException("Failed to send email");
        }
    }
}
