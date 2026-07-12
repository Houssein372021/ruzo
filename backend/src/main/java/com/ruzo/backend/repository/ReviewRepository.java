package com.ruzo.backend.repository;

import com.ruzo.backend.entity.Review;
import com.ruzo.backend.entity.ReviewStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    List<Review> findByProduct_IdAndStatus(UUID productId, ReviewStatus status, Sort sort);

    List<Review> findByStatus(ReviewStatus status, Sort sort);

    Optional<Review> findByOrder_IdAndProduct_Id(UUID orderId, UUID productId);

    void deleteByProduct_Id(UUID productId);

    void deleteByOrder_Id(UUID orderId);

    void deleteByOrder_Customer_Id(UUID customerId);
}
