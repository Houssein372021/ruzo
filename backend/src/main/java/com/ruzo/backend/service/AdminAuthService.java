package com.ruzo.backend.service;

import com.ruzo.backend.entity.AdminAccount;
import com.ruzo.backend.entity.AdminSession;
import com.ruzo.backend.repository.AdminAccountRepository;
import com.ruzo.backend.repository.AdminSessionRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminAuthService {
    private static final Duration SESSION_LIFETIME = Duration.ofHours(12);
    private static final Duration RESET_LIFETIME = Duration.ofMinutes(30);
    private static final Duration RESET_COOLDOWN = Duration.ofMinutes(1);
    private static final Duration LOGIN_WINDOW = Duration.ofMinutes(5);
    private static final int MAX_FAILED_LOGINS = 10;
    private static final Pattern TOKEN_PATTERN = Pattern.compile("[A-Za-z0-9_-]{43}");

    private final AdminAccountRepository accounts;
    private final AdminSessionRepository sessions;
    private final String email;
    private final String initialPassword;
    private final SecureRandom random = new SecureRandom();
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder();

    public AdminAuthService(
            AdminAccountRepository accounts,
            AdminSessionRepository sessions,
            @Value("${ruzo.admin.email}") String email,
            @Value("${ruzo.admin.password:}") String initialPassword) {
        this.accounts = accounts;
        this.sessions = sessions;
        this.email = email.strip().toLowerCase(Locale.ROOT);
        this.initialPassword = initialPassword;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeAccount() {
        if (!accounts.existsById(email)) {
            AdminAccount account = new AdminAccount();
            account.setEmail(email);
            if (fitsBcrypt(initialPassword)) {
                account.setPasswordHash(passwords.encode(initialPassword));
            }
            accounts.save(account);
        }
    }

    public String email() {
        return email;
    }

    @Transactional
    public Optional<String> login(String requestedEmail, String password) {
        if (!matchesEmail(requestedEmail) || !fitsBcrypt(password)) {
            return Optional.empty();
        }
        AdminAccount account = lockedAccount();
        Instant now = Instant.now();
        Instant window = account.getLoginWindowStartedAt();
        if (window == null || !now.isBefore(window.plus(LOGIN_WINDOW))) {
            account.setLoginWindowStartedAt(now);
            account.setFailedLoginAttempts(0);
        }
        if (account.getFailedLoginAttempts() >= MAX_FAILED_LOGINS) {
            return Optional.empty();
        }
        if (account.getPasswordHash() == null || !passwords.matches(password, account.getPasswordHash())) {
            account.setFailedLoginAttempts(account.getFailedLoginAttempts() + 1);
            return Optional.empty();
        }
        account.setFailedLoginAttempts(0);
        sessions.deleteExpired(now);
        String token = newToken();
        AdminSession session = new AdminSession();
        session.setTokenHash(hash(token));
        session.setEmail(email);
        session.setExpiresAt(now.plus(SESSION_LIFETIME));
        sessions.save(session);
        return Optional.of(token);
    }

    @Transactional(readOnly = true)
    public boolean isAuthenticated(String token) {
        return isToken(token) && sessions.findById(hash(token))
                .filter(session -> email.equals(session.getEmail()) && session.getExpiresAt().isAfter(Instant.now()))
                .isPresent();
    }

    @Transactional
    public void logout(String token) {
        if (isToken(token)) {
            sessions.deleteById(hash(token));
        }
    }

    @Transactional
    public Optional<String> requestReset(String requestedEmail) {
        if (!matchesEmail(requestedEmail)) {
            return Optional.empty();
        }
        AdminAccount account = lockedAccount();
        Instant now = Instant.now();
        if (account.getLastResetRequestAt() != null && now.isBefore(account.getLastResetRequestAt().plus(RESET_COOLDOWN))) {
            return Optional.empty();
        }
        String token = newToken();
        account.setLastResetRequestAt(now);
        account.setResetTokenHash(hash(token));
        account.setResetExpiresAt(now.plus(RESET_LIFETIME));
        return Optional.of(token);
    }

    @Transactional
    public boolean resetPassword(String token, String password) {
        if (!isToken(token) || !isValidNewPassword(password)) {
            return false;
        }
        AdminAccount account = lockedAccount();
        if (account.getResetTokenHash() == null || account.getResetExpiresAt() == null
                || !account.getResetExpiresAt().isAfter(Instant.now())
                || !MessageDigest.isEqual(hash(token).getBytes(StandardCharsets.US_ASCII),
                        account.getResetTokenHash().getBytes(StandardCharsets.US_ASCII))) {
            return false;
        }
        account.setPasswordHash(passwords.encode(password));
        account.setResetTokenHash(null);
        account.setResetExpiresAt(null);
        account.setFailedLoginAttempts(0);
        account.setLoginWindowStartedAt(null);
        sessions.revokeAll(email);
        return true;
    }

    public static boolean isValidNewPassword(String password) {
        return fitsBcrypt(password) && password.codePointCount(0, password.length()) >= 12;
    }

    public static String bearerToken(String authorization) {
        return authorization != null && authorization.regionMatches(true, 0, "Bearer ", 0, 7)
                ? authorization.substring(7) : null;
    }

    private AdminAccount lockedAccount() {
        return accounts.findForUpdate(email).orElseThrow();
    }

    private boolean matchesEmail(String requestedEmail) {
        return requestedEmail != null && email.equalsIgnoreCase(requestedEmail.strip());
    }

    private static boolean fitsBcrypt(String password) {
        return password != null && !password.isBlank() && password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }

    private static boolean isToken(String token) {
        return token != null && TOKEN_PATTERN.matcher(token).matches();
    }

    private String newToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.US_ASCII)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }
}
