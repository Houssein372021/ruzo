package com.ruzo.backend.repository;

import com.ruzo.backend.entity.AdminSession;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdminSessionRepository extends JpaRepository<AdminSession, String> {
    @Modifying
    @Query("delete from AdminSession session where session.expiresAt <= :now")
    void deleteExpired(@Param("now") Instant now);

    @Modifying
    @Query("delete from AdminSession session where session.email = :email")
    void revokeAll(@Param("email") String email);
}
