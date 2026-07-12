package com.ruzo.backend.controller;

import com.ruzo.backend.entity.Order;
import com.ruzo.backend.entity.OrderItem;
import com.ruzo.backend.entity.OrderStatus;
import com.ruzo.backend.entity.Product;
import com.ruzo.backend.entity.Review;
import com.ruzo.backend.entity.ReviewStatus;
import com.ruzo.backend.repository.OrderRepository;
import com.ruzo.backend.repository.ProductRepository;
import com.ruzo.backend.repository.ReviewRepository;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import org.springframework.lang.NonNull;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public ReviewController(
            ReviewRepository reviewRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/products/{productId}/reviews")
    @Transactional(readOnly = true)
    public List<ReviewResponse> productReviews(@PathVariable @NonNull UUID productId) {
        UUID id = Objects.requireNonNull(productId, "Product id is required");
        return reviewRepository
                .findByProduct_IdAndStatus(id, ReviewStatus.APPROVED, Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @GetMapping("/reviews/token/{token}")
    @Transactional(readOnly = true)
    public ReviewInvitationResponse reviewInvitation(@PathVariable String token) {
        Order order = findOrderByToken(token);
        return ReviewInvitationResponse.from(order, isReviewOpen(order));
    }

    @PostMapping("/reviews/token/{token}")
    @Transactional
    public ReviewResponse createVerifiedReview(@PathVariable String token, @RequestBody ReviewRequest request) {
        Order order = findOrderByToken(token);
        if (!isReviewOpen(order)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Reviews open after delivery");
        }
        UUID productId = Objects.requireNonNull(request.productId(), "Product id is required");
        if (request.rating() == null || request.rating() < 1 || request.rating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
        }
        if (request.body() == null || request.body().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review body is required");
        }
        boolean productBelongsToOrder = false;
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Product orderedProduct = item.getProduct();
                if (orderedProduct != null && orderedProduct.getId().equals(productId)) {
                    productBelongsToOrder = true;
                    break;
                }
            }
        }
        if (!productBelongsToOrder) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Product was not purchased in this order");
        }
        reviewRepository.findByOrder_IdAndProduct_Id(order.getId(), productId).ifPresent(review -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This product already has a review for this order");
        });

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product not found"));
        LocalDateTime now = LocalDateTime.now();
        Review review = new Review();
        review.setOrder(order);
        review.setProduct(product);
        review.setCustomerName(firstNonBlank(request.customerName(), customerName(order)));
        review.setCustomerEmail(firstNonBlank(request.customerEmail(), order.getEmail()));
        review.setRating(request.rating());
        review.setTitle(blankToNull(request.title()));
        review.setBody(request.body().trim());
        review.setStatus(ReviewStatus.PENDING);
        review.setVerifiedPurchase(true);
        review.setCreatedAt(now);
        review.setUpdatedAt(now);
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @GetMapping("/admin/reviews")
    @Transactional(readOnly = true)
    public List<AdminReviewResponse> adminReviews() {
        return reviewRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(AdminReviewResponse::from)
                .toList();
    }

    @PatchMapping("/admin/reviews/{id}/status")
    @Transactional
    public ResponseEntity<AdminReviewResponse> updateReviewStatus(
            @PathVariable @NonNull UUID id,
            @RequestBody ReviewStatusRequest request) {
        return reviewRepository.findById(id)
                .map(review -> {
                    if (request.status() == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review status is required");
                    }
                    review.setStatus(request.status());
                    review.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(AdminReviewResponse.from(reviewRepository.save(review)));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/reviews/{id}")
    @Transactional
    public ResponseEntity<Void> deleteReview(@PathVariable @NonNull UUID id) {
        UUID reviewId = Objects.requireNonNull(id, "Review id is required");
        if (!reviewRepository.existsById(reviewId)) {
            return ResponseEntity.notFound().build();
        }
        reviewRepository.deleteById(reviewId);
        return ResponseEntity.noContent().build();
    }

    private Order findOrderByToken(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Review link not found");
        }
        return orderRepository.findByReviewToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review link not found"));
    }

    private boolean isReviewOpen(Order order) {
        return order.getStatus() == OrderStatus.DELIVERED;
    }

    private static String customerName(Order order) {
        return String.join(" ",
                order.getFirstName() == null ? "" : order.getFirstName(),
                order.getLastName() == null ? "" : order.getLastName()).trim();
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "Customer";
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public record ReviewRequest(
            @NonNull UUID productId,
            String customerName,
            String customerEmail,
            Integer rating,
            String title,
            String body) {
        public ReviewRequest {
            Objects.requireNonNull(productId, "Product id is required");
        }
    }

    public record ReviewStatusRequest(ReviewStatus status) {
    }

    public record ReviewResponse(
            UUID id,
            UUID productId,
            String customerName,
            String customerEmail,
            Integer rating,
            String title,
            String body,
            ReviewStatus status,
            Boolean verifiedPurchase,
            LocalDateTime createdAt) {
        static ReviewResponse from(Review review) {
            return new ReviewResponse(
                    review.getId(),
                    review.getProduct() == null ? null : review.getProduct().getId(),
                    review.getCustomerName(),
                    review.getCustomerEmail(),
                    review.getRating(),
                    review.getTitle(),
                    review.getBody(),
                    review.getStatus(),
                    review.getVerifiedPurchase(),
                    review.getCreatedAt());
        }
    }

    public record AdminReviewResponse(
            UUID id,
            UUID productId,
            String productName,
            String orderNumber,
            String customerName,
            String customerEmail,
            Integer rating,
            String title,
            String body,
            ReviewStatus status,
            Boolean verifiedPurchase,
            LocalDateTime createdAt) {
        static AdminReviewResponse from(Review review) {
            Product product = review.getProduct();
            Order order = review.getOrder();
            return new AdminReviewResponse(
                    review.getId(),
                    product == null ? null : product.getId(),
                    product == null ? "" : firstNonBlank(product.getNameEn(), product.getSlug()),
                    order == null ? "" : order.getOrderNumber(),
                    review.getCustomerName(),
                    review.getCustomerEmail(),
                    review.getRating(),
                    review.getTitle(),
                    review.getBody(),
                    review.getStatus(),
                    review.getVerifiedPurchase(),
                    review.getCreatedAt());
        }
    }

    public record ReviewInvitationResponse(
            String orderNumber,
            boolean reviewOpen,
            List<ReviewProductResponse> products) {
        static ReviewInvitationResponse from(Order order, boolean reviewOpen) {
            Map<UUID, ReviewProductResponse> productsById = new LinkedHashMap<>();
            if (order.getItems() != null) {
                order.getItems().stream()
                        .filter(item -> item.getProduct() != null)
                        .sorted(Comparator
                                .comparing(item -> item.getProductName() == null ? "" : item.getProductName()))
                        .forEach(item -> productsById.putIfAbsent(item.getProduct().getId(),
                                ReviewProductResponse.from(item)));
            }
            List<ReviewProductResponse> products = List.copyOf(productsById.values());
            return new ReviewInvitationResponse(order.getOrderNumber(), reviewOpen, products);
        }
    }

    public record ReviewProductResponse(
            UUID productId,
            String productName,
            String imageUrl) {
        static ReviewProductResponse from(OrderItem item) {
            Product product = item.getProduct();
            String imageUrl = "";
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                imageUrl = product.getImages().get(0).getImageUrl();
            }
            return new ReviewProductResponse(
                    product.getId(),
                    firstNonBlank(item.getProductName(), product.getNameEn(), product.getSlug()),
                    imageUrl);
        }
    }
}
