package com.ruzo.backend.controller;

import com.ruzo.backend.entity.Category;
import com.ruzo.backend.entity.Product;
import com.ruzo.backend.entity.ProductImage;
import com.ruzo.backend.entity.ProductVariant;
import com.ruzo.backend.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<ProductResponse> getProducts() {
        return productRepository.findByActiveTrue()
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    @GetMapping("/{slug}")
    @Transactional(readOnly = true)
    public ResponseEntity<ProductResponse> getProductBySlug(@PathVariable String slug) {
        return productRepository.findBySlugAndActiveTrue(slug)
                .map(ProductResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record ProductResponse(
            UUID id,
            String slug,
            CategoryResponse category,
            String nameEn,
            String nameAr,
            String shortDescriptionEn,
            String shortDescriptionAr,
            String descriptionEn,
            String descriptionAr,
            String fabricCareEn,
            String fabricCareAr,
            BigDecimal price,
            BigDecimal salePrice,
            String badge,
            Boolean active,
            String videoUrl,
            List<ProductImageResponse> images,
            List<ProductVariantResponse> variants
    ) {

        static ProductResponse from(Product product) {
            return new ProductResponse(
                    product.getId(),
                    product.getSlug(),
                    CategoryResponse.from(product.getCategory()),
                    product.getNameEn(),
                    product.getNameAr(),
                    product.getShortDescriptionEn(),
                    product.getShortDescriptionAr(),
                    product.getDescriptionEn(),
                    product.getDescriptionAr(),
                    product.getFabricCareEn(),
                    product.getFabricCareAr(),
                    product.getPrice(),
                    product.getSalePrice(),
                    product.getBadge(),
                    product.getActive(),
                    product.getVideoUrl(),
                    product.getImages().stream().map(ProductImageResponse::from).toList(),
                    product.getVariants().stream().map(ProductVariantResponse::from).toList()
            );
        }
    }

    public record CategoryResponse(
            UUID id,
            String slug,
            String nameEn,
            String nameAr,
            String imageUrl,
            Boolean isActive,
            Integer sortOrder
    ) {

        static CategoryResponse from(Category category) {
            if (category == null) {
                return null;
            }

            return new CategoryResponse(
                    category.getId(),
                    category.getSlug(),
                    category.getNameEn(),
                    category.getNameAr(),
                    category.getImageUrl(),
                    category.getIsActive(),
                    category.getSortOrder()
            );
        }
    }

    public record ProductImageResponse(
            UUID id,
            String imageUrl,
            Integer sortOrder
    ) {

        static ProductImageResponse from(ProductImage image) {
            return new ProductImageResponse(
                    image.getId(),
                    image.getImageUrl(),
                    image.getSortOrder()
            );
        }
    }

    public record ProductVariantResponse(
            UUID id,
            String color,
            String colorHex,
            String size,
            Integer stock,
            String imageUrl
    ) {

        static ProductVariantResponse from(ProductVariant variant) {
            return new ProductVariantResponse(
                    variant.getId(),
                    variant.getColor(),
                    variant.getColorHex(),
                    variant.getSize(),
                    variant.getStock(),
                    variant.getImageUrl()
            );
        }
    }
}
