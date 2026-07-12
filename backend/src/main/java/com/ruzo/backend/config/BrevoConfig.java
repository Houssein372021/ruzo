package com.ruzo.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
public class BrevoConfig {

    private final String apiKey;
    private final String senderEmail;
    private final String senderName;
    private final String ownerEmail;
    private final String publicUrl;

    public BrevoConfig(
            @Value("${brevo.api-key:}") String apiKey,
            @Value("${brevo.sender-email:noreply@rüzo.com}") String senderEmail,
            @Value("${brevo.sender-name:RÜZO}") String senderName,
            @Value("${site.owner-email:housseinghannoum@803gmail.com}") String ownerEmail,
            @Value("${site.public-url:https://www.rüzo.com}") String publicUrl
    ) {
        this.apiKey = apiKey;
        this.senderEmail = senderEmail;
        this.senderName = senderName;
        this.ownerEmail = ownerEmail;
        this.publicUrl = publicUrl;
    }

    public String apiKey() {
        return apiKey;
    }

    public String senderEmail() {
        return senderEmail;
    }

    public String senderName() {
        return senderName;
    }

    public String ownerEmail() {
        return ownerEmail;
    }

    public String publicUrl() {
        return publicUrl;
    }

    public boolean isEnabled() {
        return StringUtils.hasText(apiKey);
    }
}
