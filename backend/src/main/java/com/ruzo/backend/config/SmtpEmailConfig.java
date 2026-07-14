package com.ruzo.backend.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
public class SmtpEmailConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(SmtpEmailConfig.class);

    private final String host;
    private final String username;
    private final String password;
    private final String senderEmail;
    private final String senderName;
    private final String ownerEmail;
    private final String publicUrl;

    public SmtpEmailConfig(
            @Value("${spring.mail.host:smtp.ionos.com}") String host,
            @Value("${spring.mail.username:noreply@xn--rzo-hoa.com}") String username,
            @Value("${spring.mail.password:}") String password,
            @Value("${smtp.sender-email:noreply@xn--rzo-hoa.com}") String senderEmail,
            @Value("${smtp.sender-name:RÜZO}") String senderName,
            @Value("${site.owner-email:noreply@xn--rzo-hoa.com}") String ownerEmail,
            @Value("${site.public-url:https://www.rüzo.com}") String publicUrl
    ) {
        this.host = host;
        this.username = username;
        this.password = password;
        this.senderEmail = senderEmail;
        this.senderName = senderName;
        this.ownerEmail = ownerEmail;
        this.publicUrl = publicUrl;
    }

    @PostConstruct
    void logConfiguration() {
        LOGGER.info(
                "SMTP email configuration: enabled={}, host={}, username={}, senderEmail={}, ownerEmail={}",
                isEnabled(),
                host,
                username,
                senderEmail,
                ownerEmail
        );
    }

    public String host() {
        return host;
    }

    public String username() {
        return username;
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
        return StringUtils.hasText(host)
                && StringUtils.hasText(username)
                && StringUtils.hasText(password)
                && StringUtils.hasText(senderEmail);
    }
}
