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

    public record HomepageResponse(String discoverUrl, HeroMediaResponse heroMedia) {
        static HomepageResponse from(HomepageSettings settings) {
            return new HomepageResponse(
                    settings.getDiscoverUrl(),
                    HeroMediaResponse.from(settings.getActiveHeroMedia()));
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
