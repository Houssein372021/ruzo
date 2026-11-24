package com.ruzo.backend.repository;

import com.ruzo.backend.entity.AdminAccount;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdminAccountRepository extends JpaRepository<AdminAccount, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select account from AdminAccount account where account.email = :email")
    Optional<AdminAccount> findForUpdate(@Param("email") String email);
}
