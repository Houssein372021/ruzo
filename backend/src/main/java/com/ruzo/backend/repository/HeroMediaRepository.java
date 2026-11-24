package com.ruzo.backend.repository;

import com.ruzo.backend.entity.HeroMedia;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HeroMediaRepository extends JpaRepository<HeroMedia, UUID> {

    Optional<HeroMedia> findByMediaUrl(String mediaUrl);

    List<HeroMedia> findAllByOrderByCreatedAtDesc();
}
