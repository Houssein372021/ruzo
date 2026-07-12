package com.ruzo.backend.controller;

import java.util.Objects;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final String adminEmail;
    private final String adminPassword;
    private final String adminToken;

    public AuthController(
            @Value("${ruzo.admin.email:admin@ruzo.local}") String adminEmail,
            @Value("${ruzo.admin.password:Ruzo@2026}") String adminPassword,
            @Value("${ruzo.admin.token:ruzo-admin-token}") String adminToken
    ) {
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminToken = adminToken;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        if (!Objects.equals(request.email(), adminEmail) || !Objects.equals(request.password(), adminPassword)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(new LoginResponse(
                adminToken,
                new AdminUser("Rüzo Admin", adminEmail)
        ));
    }

    public record LoginRequest(String email, String password) {
    }

    public record LoginResponse(String token, AdminUser user) {
    }

    public record AdminUser(String name, String email) {
    }
}
