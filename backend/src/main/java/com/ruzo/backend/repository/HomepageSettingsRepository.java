package com.ruzo.backend.repository;

import com.ruzo.backend.entity.HomepageSettings;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HomepageSettingsRepository extends JpaRepository<HomepageSettings, UUID> {

    Optional<HomepageSettings> findBySettingsKey(String settingsKey);
}
