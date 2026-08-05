package com.tcs.bobench.service;

import com.tcs.bobench.dto.response.CaptchaResponse;

public interface CaptchaService {
    CaptchaResponse generateCaptcha(String ipAddress);
    void validateCaptcha(String captchaId, String captchaAnswer, String ipAddress);
}
