package com.ruzo.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "admin_accounts")
@Getter
@Setter
public class AdminAccount {
    @Id
    private String email;
    private String passwordHash;
    private String resetTokenHash;
    private Instant resetExpiresAt;
    private Instant lastResetRequestAt;
    private Instant loginWindowStartedAt;
    private int failedLoginAttempts;
}
