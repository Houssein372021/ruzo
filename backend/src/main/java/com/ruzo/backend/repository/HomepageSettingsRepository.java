package com.ruzo.backend.repository;

import com.ruzo.backend.entity.HomepageSettings;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HomepageSettingsRepository extends JpaRepository<HomepageSettings, UUID> {

    Optional<HomepageSettings> findBySettingsKey(String settingsKey);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select settings from HomepageSettings settings where settings.settingsKey = :settingsKey")
    Optional<HomepageSettings> findForUpdate(@Param("settingsKey") String settingsKey);
}
