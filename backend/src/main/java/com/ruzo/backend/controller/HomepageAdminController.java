package com.ruzo.backend.controller;

import com.ruzo.backend.controller.HomepageController.HeroMediaResponse;
import com.ruzo.backend.controller.HomepageController.SecondaryHeroResponse;
import com.ruzo.backend.entity.HeroMedia;
import com.ruzo.backend.entity.HeroMediaType;
import com.ruzo.backend.entity.HomepageSettings;
import com.ruzo.backend.service.HomepageSettingsService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/homepage")
public class HomepageAdminController {

    private final HomepageSettingsService homepageSettingsService;

    public HomepageAdminController(HomepageSettingsService homepageSettingsService) {
        this.homepageSettingsService = homepageSettingsService;
    }

    @GetMapping
    @Transactional
    public HomepageAdminResponse getSettings() {
        return toResponse(homepageSettingsService.getOrCreateSettings());
    }

    @PutMapping
    @Transactional
    public HomepageAdminResponse updateSettings(@RequestBody HomepageSettingsRequest request) {
        return toResponse(homepageSettingsService.updateSettings(
                request.discoverUrl(),
                request.activeHeroMediaId()));
    }

    @PutMapping("/secondary")
    @Transactional
    public HomepageAdminResponse updateSecondaryHero(@RequestBody SecondaryHeroRequest request) {
        return toResponse(homepageSettingsService.updateSecondaryHero(
                request.discoverUrl(), request.activeHeroMediaId(), request.enabled()));
    }

    @PostMapping("/media")
    @Transactional
    public HeroMediaArchiveResponse createMedia(@RequestBody HeroMediaRequest request) {
        HeroMedia media = homepageSettingsService.createMedia(
                request.mediaType(),
                request.mediaUrl(),
                request.posterUrl(),
                request.originalFileName());
        return HeroMediaArchiveResponse.from(media);
    }

    @DeleteMapping("/media/{id}")
    public ResponseEntity<Void> deleteMedia(@PathVariable UUID id) {
        homepageSettingsService.deleteArchivedMedia(id);
        return ResponseEntity.noContent().build();
    }

    private HomepageAdminResponse toResponse(HomepageSettings settings) {
        return new HomepageAdminResponse(
                settings.getDiscoverUrl(),
                HeroMediaResponse.from(settings.getActiveHeroMedia()),
                SecondaryHeroResponse.from(settings),
                homepageSettingsService.getArchive().stream()
                        .map(HeroMediaArchiveResponse::from)
                        .toList());
    }

    public record HomepageSettingsRequest(String discoverUrl, UUID activeHeroMediaId) {
    }

    public record SecondaryHeroRequest(String discoverUrl, UUID activeHeroMediaId, boolean enabled) {
    }

    public record HeroMediaRequest(
            HeroMediaType mediaType,
            String mediaUrl,
            String posterUrl,
            String originalFileName) {
    }

    public record HomepageAdminResponse(
            String discoverUrl,
            HeroMediaResponse heroMedia,
            SecondaryHeroResponse secondaryHero,
            List<HeroMediaArchiveResponse> archive) {
    }

    public record HeroMediaArchiveResponse(
            UUID id,
            HeroMediaType mediaType,
            String mediaUrl,
            String posterUrl,
            String originalFileName,
            LocalDateTime createdAt) {
        static HeroMediaArchiveResponse from(HeroMedia media) {
            return new HeroMediaArchiveResponse(
                    media.getId(),
                    media.getMediaType(),
                    media.getMediaUrl(),
                    media.getPosterUrl(),
                    media.getOriginalFileName(),
                    media.getCreatedAt());
        }
    }
}
