package com.ruzo.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;
import org.springframework.lang.NonNull;

public record CreateOrderItemRequest(
                @NonNull UUID productId,
                @JsonAlias("name") String productName,
                String color,
                String size,
                Integer quantity,
                @JsonAlias("price") BigDecimal unitPrice) {
        public CreateOrderItemRequest {
                Objects.requireNonNull(productId, "Product id is required");
        }
}
