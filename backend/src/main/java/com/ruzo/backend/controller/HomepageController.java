package com.ruzo.backend.controller;

import com.ruzo.backend.entity.HeroMedia;
import com.ruzo.backend.entity.HeroMediaType;
import com.ruzo.backend.entity.HomepageSettings;
import com.ruzo.backend.service.HomepageSettingsService;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/homepage")
public class HomepageController {

    private final HomepageSettingsService homepageSettingsService;

    public HomepageController(HomepageSettingsService homepageSettingsService) {
        this.homepageSettingsService = homepageSettingsService;
    }

    @GetMapping
    @Transactional
    public HomepageResponse getHomepage() {
        return HomepageResponse.from(homepageSettingsService.getOrCreateSettings());
    }

    public record HomepageResponse(String discoverUrl, HeroMediaResponse heroMedia, SecondaryHeroResponse secondaryHero) {
        static HomepageResponse from(HomepageSettings settings) {
            return new HomepageResponse(
                    settings.getDiscoverUrl(),
                    HeroMediaResponse.from(settings.getActiveHeroMedia()),
                    Boolean.TRUE.equals(settings.getSecondaryHeroEnabled()) ? SecondaryHeroResponse.from(settings) : null);
        }
    }

    public record SecondaryHeroResponse(String discoverUrl, HeroMediaResponse heroMedia, boolean enabled) {
        static SecondaryHeroResponse from(HomepageSettings settings) {
            String url = settings.getSecondaryDiscoverUrl();
            return new SecondaryHeroResponse(
                    url == null ? HomepageSettingsService.DEFAULT_DISCOVER_URL : url,
                    HeroMediaResponse.from(settings.getSecondaryHeroMedia()),
                    Boolean.TRUE.equals(settings.getSecondaryHeroEnabled()));
        }
    }

    public record HeroMediaResponse(
            UUID id,
            HeroMediaType mediaType,
            String mediaUrl,
            String posterUrl,
            String originalFileName) {
        static HeroMediaResponse from(HeroMedia media) {
            if (media == null) {
                return null;
            }
            return new HeroMediaResponse(
                    media.getId(),
                    media.getMediaType(),
                    media.getMediaUrl(),
                    media.getPosterUrl(),
                    media.getOriginalFileName());
        }
    }
}
