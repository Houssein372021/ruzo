package com.ruzo.backend.controller;

import com.ruzo.backend.service.AdminAuthService;
import com.ruzo.backend.service.EmailNotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);
    private final AdminAuthService adminAuth;
    private final EmailNotificationService emails;

    public AuthController(AdminAuthService adminAuth, EmailNotificationService emails) {
        this.adminAuth = adminAuth;
        this.emails = emails;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return adminAuth.login(request.email(), request.password())
                .map(token -> ResponseEntity.ok(new LoginResponse(token, new AdminUser("Rüzo Admin", adminAuth.email()))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        adminAuth.logout(AdminAuthService.bearerToken(authorization));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        adminAuth.requestReset(request.email()).ifPresent(token -> {
            try {
                emails.sendAdminPasswordReset(adminAuth.email(), token);
            } catch (RuntimeException exception) {
                LOGGER.warn("Admin password reset email could not be sent ({})", exception.getClass().getSimpleName());
            }
        });
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (!AdminAuthService.isValidNewPassword(request.password())) {
            return ResponseEntity.unprocessableEntity().build();
        }
        if (!adminAuth.resetPassword(request.token(), request.password())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.noContent().build();
    }

    public record LoginRequest(String email, String password) {
    }

    public record ForgotPasswordRequest(String email) {
    }

    public record ResetPasswordRequest(String token, String password) {
    }

    public record LoginResponse(String token, AdminUser user) {
    }

    public record AdminUser(String name, String email) {
    }
}
