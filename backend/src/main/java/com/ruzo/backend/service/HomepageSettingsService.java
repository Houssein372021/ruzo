package com.ruzo.backend.service;

import com.ruzo.backend.entity.HeroMedia;
import com.ruzo.backend.entity.HeroMediaType;
import com.ruzo.backend.entity.HomepageSettings;
import com.ruzo.backend.repository.HeroMediaRepository;
import com.ruzo.backend.repository.HomepageSettingsRepository;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class HomepageSettingsService {

    public static final String DEFAULT_DISCOVER_URL = "/collections/all";
    public static final String DEFAULT_HERO_URL = "/hero-ruzo.mp4";
    public static final String DEFAULT_HERO_POSTER_URL = "/hero-ruzo-poster.webp";

    private static final String SETTINGS_KEY = "homepage";

    private final HomepageSettingsRepository settingsRepository;
    private final HeroMediaRepository heroMediaRepository;

    public HomepageSettingsService(
            HomepageSettingsRepository settingsRepository,
            HeroMediaRepository heroMediaRepository) {
        this.settingsRepository = settingsRepository;
        this.heroMediaRepository = heroMediaRepository;
    }

    @Transactional
    public HomepageSettings getOrCreateSettings() {
        return settingsRepository.findBySettingsKey(SETTINGS_KEY).orElseGet(() -> {
            HeroMedia initialMedia = heroMediaRepository.findByMediaUrl(DEFAULT_HERO_URL)
                    .orElseGet(() -> createInitialMedia());

            HomepageSettings settings = new HomepageSettings();
            settings.setSettingsKey(SETTINGS_KEY);
            settings.setDiscoverUrl(DEFAULT_DISCOVER_URL);
            settings.setActiveHeroMedia(initialMedia);
            settings.setUpdatedAt(LocalDateTime.now());
            return settingsRepository.save(settings);
        });
    }

    @Transactional(readOnly = true)
    public List<HeroMedia> getArchive() {
        return heroMediaRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public HeroMedia createMedia(
            HeroMediaType mediaType,
            String mediaUrl,
            String posterUrl,
            String originalFileName) {
        if (mediaType == null || mediaUrl == null || mediaUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Media type and URL are required");
        }

        HeroMedia media = new HeroMedia();
        media.setMediaType(mediaType);
        media.setMediaUrl(mediaUrl.trim());
        media.setPosterUrl(normalizeOptional(posterUrl));
        media.setOriginalFileName(normalizeOptional(originalFileName));
        media.setCreatedAt(LocalDateTime.now());
        return heroMediaRepository.save(media);
    }

    @Transactional
    public void deleteArchivedMedia(UUID mediaId) {
        HomepageSettings settings = getSettingsForUpdate();
        if (hasMediaId(settings.getActiveHeroMedia(), mediaId)
                || hasMediaId(settings.getSecondaryHeroMedia(), mediaId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Media is still selected for a hero");
        }
        heroMediaRepository.deleteById(mediaId);
    }

    @Transactional
    public HomepageSettings updateSettings(String discoverUrl, UUID activeHeroMediaId) {
        HomepageSettings settings = getSettingsForUpdate();
        settings.setDiscoverUrl(validateDiscoverUrl(discoverUrl));

        if (activeHeroMediaId != null) {
            settings.setActiveHeroMedia(findMedia(activeHeroMediaId));
        }

        settings.setUpdatedAt(LocalDateTime.now());
        return settingsRepository.save(settings);
    }

    @Transactional
    public HomepageSettings updateSecondaryHero(String discoverUrl, UUID mediaId, boolean enabled) {
        HomepageSettings settings = getSettingsForUpdate();
        settings.setSecondaryDiscoverUrl(validateDiscoverUrl(discoverUrl));
        if (mediaId != null) {
            settings.setSecondaryHeroMedia(findMedia(mediaId));
        }
        if (enabled && settings.getSecondaryHeroMedia() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select a media file first");
        }
        settings.setSecondaryHeroEnabled(enabled);
        settings.setUpdatedAt(LocalDateTime.now());
        return settingsRepository.save(settings);
    }

    private HomepageSettings getSettingsForUpdate() {
        return settingsRepository.findForUpdate(SETTINGS_KEY).orElseGet(this::getOrCreateSettings);
    }

    private static boolean hasMediaId(HeroMedia media, UUID id) {
        return media != null && id.equals(media.getId());
    }

    private HeroMedia findMedia(UUID id) {
        return heroMediaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hero media not found"));
    }

    String validateDiscoverUrl(String value) {
        if (value == null || value.isBlank()) {
            return DEFAULT_DISCOVER_URL;
        }

        String url = value.trim();
        try {
            URI uri = new URI(url);
            if (url.startsWith("/") && !url.startsWith("//") && uri.getRawAuthority() == null) {
                return url;
            }
            if (("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))
                    && uri.getHost() != null) {
                return url;
            }
        } catch (URISyntaxException ignored) {
            // Report a consistent validation error below.
        }

        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Discover URL must be an internal path or an HTTP(S) URL");
    }

    private HeroMedia createInitialMedia() {
        HeroMedia media = new HeroMedia();
        media.setMediaType(HeroMediaType.VIDEO);
        media.setMediaUrl(DEFAULT_HERO_URL);
        media.setPosterUrl(DEFAULT_HERO_POSTER_URL);
        media.setOriginalFileName("Original RÜZO hero");
        media.setCreatedAt(LocalDateTime.now());
        return heroMediaRepository.save(media);
    }

    private static String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
