package com.ruzo.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "homepage_settings")
public class HomepageSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "settings_key", nullable = false, unique = true)
    private String settingsKey;

    @Column(name = "discover_url", nullable = false, columnDefinition = "TEXT")
    private String discoverUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "active_hero_media_id")
    private HeroMedia activeHeroMedia;

    @Column(name = "secondary_discover_url", columnDefinition = "TEXT")
    private String secondaryDiscoverUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "secondary_hero_media_id")
    private HeroMedia secondaryHeroMedia;

    @Column(name = "secondary_hero_enabled")
    private Boolean secondaryHeroEnabled;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
