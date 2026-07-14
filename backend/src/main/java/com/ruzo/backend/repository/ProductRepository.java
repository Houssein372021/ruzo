package com.ruzo.backend.repository;

import com.ruzo.backend.entity.Product;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySlug(String slug);

    List<Product> findByActiveTrue();

    List<Product> findByFeaturedMenuTrueAndActiveTrueOrderByFeaturedMenuOrderAsc();

    Optional<Product> findBySlugAndActiveTrue(String slug);
}
