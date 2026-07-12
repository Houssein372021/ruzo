package com.ruzo.backend.config;

import com.ruzo.backend.entity.Category;
import com.ruzo.backend.entity.Product;
import com.ruzo.backend.entity.ProductImage;
import com.ruzo.backend.entity.ProductVariant;
import com.ruzo.backend.repository.CategoryRepository;
import com.ruzo.backend.repository.ProductImageRepository;
import com.ruzo.backend.repository.ProductRepository;
import com.ruzo.backend.repository.ProductVariantRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
@ConditionalOnProperty(name = "ruzo.catalog.seed", havingValue = "true", matchIfMissing = true)
public class CatalogProductSeeder implements CommandLineRunner {

    private static final String PRODUCT_VIDEO_URL = "/hero.mp4";
    private static final List<String> SIZES = List.of("XS", "S", "M", "L");

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;

    public CatalogProductSeeder(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            ProductVariantRepository productVariantRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.productVariantRepository = productVariantRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Category sets = requireCategory("sets");
        Category sportBras = requireCategory("sport-bras");
        Category bottoms = requireCategory("bottoms");

        upsertProduct(
                sets,
                "ruzo-sculpt-set",
                "Rüzo Sculpt Set",
                "\u0637\u0642\u0645 \u0647\u0627\u0631\u062a\u0627 \u0633\u0643\u0644\u0628\u062a",
                "Matching sports bra and high waist leggings in sculpting stretch fabric.",
                "\u0637\u0642\u0645 \u0631\u064a\u0627\u0636\u064a \u0645\u0646 \u062d\u0645\u0627\u0644\u0629 \u0635\u062f\u0631 \u0648\u0644\u064a\u0642\u0646\u0632 \u0628\u062e\u0635\u0631 \u0639\u0627\u0644.",
                "72.00",
                "NEW",
                List.of(
                        "/products/set-front.png",
                        "/products/set-back.png",
                        "/products/set-angle-detail.png",
                        "/products/set-black.png",
                        "/products/set-ivory.png",
                        "/products/set-taupe.png",
                        "/products/set-rose.png"
                ),
                List.of(
                        color("Black", "#111111", "/products/set-black.png", 10),
                        color("Ivory", "#F5EFE3", "/products/set-ivory.png", 9),
                        color("Taupe", "#BCA895", "/products/set-taupe.png", 8),
                        color("Rose", "#D88FA1", "/products/set-rose.png", 8)
                )
        );

        upsertProduct(
                sportBras,
                "luxe-support-sports-bra",
                "Luxe Support Sport Bra",
                "\u062d\u0645\u0627\u0644\u0629 \u0644\u0648\u0643\u0633 \u0627\u0644\u0631\u064a\u0627\u0636\u064a\u0629",
                "Minimal medium-support sport bra with a clean scoop neckline.",
                "\u062d\u0645\u0627\u0644\u0629 \u0631\u064a\u0627\u0636\u064a\u0629 \u0628\u062f\u0639\u0645 \u0645\u062a\u0648\u0633\u0637 \u0648\u0642\u0635\u0629 \u0628\u0633\u064a\u0637\u0629.",
                "42.00",
                "BEST_SELLER",
                List.of(
                        "/products/sports-bra-front.png",
                        "/products/sports-bra-back.png",
                        "/products/sports-bra-details.png",
                        "/products/sports-bra-beige.png",
                        "/products/sports-bra-black.png",
                        "/products/sports-bra-ivory.png",
                        "/products/sports-bra-taupe.png",
                        "/products/sports-bra-rose.png"
                ),
                List.of(
                        color("Beige", "#D8C3A5", "/products/sports-bra-beige.png", 10),
                        color("Black", "#111111", "/products/sports-bra-black.png", 14),
                        color("Ivory", "#F5EFE3", "/products/sports-bra-ivory.png", 12),
                        color("Taupe", "#BCA895", "/products/sports-bra-taupe.png", 11),
                        color("Rose", "#D88FA1", "/products/sports-bra-rose.png", 11)
                )
        );

        upsertProduct(
                bottoms,
                "elevate-high-waist-leggings",
                "Elevate High Waist Leggings",
                "\u0644\u064a\u0642\u0646\u0632 \u0628\u062e\u0635\u0631 \u0639\u0627\u0644",
                "High waist leggings with a sculpting V seam and soft compression.",
                "\u0644\u064a\u0642\u0646\u0632 \u0628\u062e\u0635\u0631 \u0639\u0627\u0644 \u0648\u0642\u0635\u0629 \u0645\u0646\u062d\u0648\u062a\u0629.",
                "54.00",
                "LIMITED",
                List.of(
                        "/products/bottoms-front.png",
                        "/products/bottoms-back.png",
                        "/products/bottoms-angle-detail.png",
                        "/products/bottoms-rose.png",
                        "/products/bottoms-black.png",
                        "/products/bottoms-ivory.png"
                ),
                List.of(
                        color("Black", "#111111", "/products/bottoms-black.png", 12),
                        color("Ivory", "#F5EFE3", "/products/bottoms-ivory.png", 10),
                        color("Taupe", "#BCA895", "/products/bottoms-front.png", 9),
                        color("Rose", "#D88FA1", "/products/bottoms-rose.png", 10)
                )
        );
    }

    private Category requireCategory(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalStateException("Missing category: " + slug));
    }

    private void upsertProduct(
            Category category,
            String slug,
            String nameEn,
            String nameAr,
            String descriptionEn,
            String descriptionAr,
            String price,
            String badge,
            List<String> images,
            List<ColorMedia> colors
    ) {
        Product product = productRepository.findBySlug(slug).orElseGet(Product::new);
        LocalDateTime now = LocalDateTime.now();

        product.setSlug(slug);
        product.setCategory(category);
        product.setTitleEn(nameEn);
        product.setTitleAr(nameAr);
        product.setNameEn(nameEn);
        product.setNameAr(nameAr);
        product.setDescriptionEn(descriptionEn);
        product.setDescriptionAr(descriptionAr);
        product.setPrice(new BigDecimal(price));
        product.setSalePrice(null);
        product.setBadge(badge);
        product.setActive(true);
        product.setVideoUrl(PRODUCT_VIDEO_URL);
        if (product.getCreatedAt() == null) {
            product.setCreatedAt(now);
        }
        product.setUpdatedAt(now);

        Product saved = productRepository.save(product);
        productImageRepository.deleteByProduct_Id(saved.getId());
        productVariantRepository.deleteByProduct_Id(saved.getId());
        saved.getImages().clear();
        saved.getVariants().clear();

        for (int index = 0; index < images.size(); index++) {
            ProductImage image = new ProductImage();
            image.setProduct(saved);
            image.setImageUrl(images.get(index));
            image.setSortOrder(index + 1);
            saved.getImages().add(productImageRepository.save(image));
        }

        for (ColorMedia color : colors) {
            for (String size : SIZES) {
                ProductVariant variant = new ProductVariant();
                variant.setProduct(saved);
                variant.setColor(color.name());
                variant.setColorHex(color.hex());
                variant.setSize(size);
                variant.setStock(color.stock());
                variant.setImageUrl(color.imageUrl());
                saved.getVariants().add(productVariantRepository.save(variant));
            }
        }
    }

    private ColorMedia color(String name, String hex, String imageUrl, int stock) {
        return new ColorMedia(name, hex, imageUrl, stock);
    }

    private record ColorMedia(String name, String hex, String imageUrl, int stock) {
    }
}
