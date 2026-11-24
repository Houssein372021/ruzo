package com.ruzo.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "admin_sessions")
@Getter
@Setter
public class AdminSession {
    @Id
    private String tokenHash;
    private String email;
    private Instant expiresAt;
}
