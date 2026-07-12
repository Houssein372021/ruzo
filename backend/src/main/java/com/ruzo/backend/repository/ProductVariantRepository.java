package com.ruzo.backend.repository;

import com.ruzo.backend.entity.ProductVariant;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {

    void deleteByProduct_Id(UUID productId);
}
