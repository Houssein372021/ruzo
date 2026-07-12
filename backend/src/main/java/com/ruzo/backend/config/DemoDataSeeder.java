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
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "ruzo.demo.seed", havingValue = "true")
public class DemoDataSeeder implements CommandLineRunner {

    private static final String PRODUCT_VIDEO_URL = "/hero.mp4";

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;

    public DemoDataSeeder(
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
        Category sets = upsertCategory(
                "sets",
                "Sets",
                "الأطقم",
                "/categories/sets.png",
                10
        );
        Category sportsBras = upsertCategory(
                "sport-bras",
                "Sport Bras",
                "حمالات رياضية",
                "/categories/sports-bras.png",
                20
        );
        Category bottoms = upsertCategory(
                "bottoms",
                "Bottoms",
                "السراويل",
                "/categories/bottoms.png",
                30
        );

        upsertProduct(
                sets,
                "sculpt-zip-set",
                "Sculpt Zip Set",
                "طقم سكالب بسحاب",
                "A soft structured zip set made for studio mornings and quiet city movement.",
                "طقم ناعم ومنحوت للحركة اليومية والتمارين الهادئة.",
                "78.00",
                List.of(
                        media("Chocolate", "#4B2E24", "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=80"),
                        media("Sand", "#D8C3A5", "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=1200&q=80"),
                        media("Soft Black", "#111111", "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?auto=format&fit=crop&w=1200&q=80")
                )
        );
        upsertProduct(
                sets,
                "aura-ribbed-set",
                "Aura Ribbed Set",
                "طقم أورا المضلع",
                "Ribbed activewear with a feminine fit, light compression, and polished lines.",
                "طقم رياضي مضلع بقصة أنثوية ودعم خفيف وخطوط أنيقة.",
                "82.00",
                List.of(
                        media("Mocha", "#7A5548", "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=1200&q=80"),
                        media("Ivory", "#F8F4EC", "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?auto=format&fit=crop&w=1200&q=80")
                )
        );

        upsertProduct(
                sportsBras,
                "align-sports-bra",
                "Align Sports Bra",
                "حمالة ألاين الرياضية",
                "A clean support bra with soft straps, removable cups, and a smooth studio feel.",
                "حمالة دعم ناعمة بأشرطة مريحة وإحساس سلس للتمارين.",
                "38.00",
                List.of(
                        media("Cocoa", "#5B3528", "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80"),
                        media("Cream", "#EFE3D2", "https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=1200&q=80"),
                        media("Black", "#111111", "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=1200&q=80")
                )
        );
        upsertProduct(
                sportsBras,
                "studio-cross-bra",
                "Studio Cross Bra",
                "حمالة ستوديو كروس",
                "A cross-back bra with medium support and refined contrast details.",
                "حمالة ظهر متقاطع بدعم متوسط وتفاصيل أنيقة.",
                "42.00",
                List.of(
                        media("Espresso", "#3B241C", "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80"),
                        media("Taupe", "#A58A73", "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1200&q=80")
                )
        );

        upsertProduct(
                bottoms,
                "high-rise-legging",
                "High Rise Legging",
                "ليغنغ بخصر عال",
                "Sculpting high-rise leggings with a second-skin feel and elegant matte finish.",
                "ليغنغ بخصر عال وإحساس ناعم ولمسة مطفية راقية.",
                "54.00",
                List.of(
                        media("Chocolate", "#4B2E24", "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1200&q=80"),
                        media("Sand", "#D8C3A5", "https://images.unsplash.com/photo-1522844990619-4951c40f7eda?auto=format&fit=crop&w=1200&q=80"),
                        media("Black", "#111111", "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80")
                )
        );
        upsertProduct(
                bottoms,
                "flow-wide-leg-pant",
                "Flow Wide Leg Pant",
                "بنطال فلو الواسع",
                "A wide-leg active pant made for warmups, travel days, and off-duty styling.",
                "بنطال رياضي واسع مناسب للإحماء والسفر والإطلالات اليومية.",
                "62.00",
                List.of(
                        media("Brown", "#6F4536", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80"),
                        media("Stone", "#C9B8A4", "https://images.unsplash.com/photo-1506629905607-d9c297d1f5e1?auto=format&fit=crop&w=1200&q=80")
                )
        );

        ensureAllProductsHaveVideo();
    }

    private Category upsertCategory(String slug, String nameEn, String nameAr, String imageUrl, int sortOrder) {
        Category category = categoryRepository.findBySlug(slug).orElseGet(Category::new);
        category.setSlug(slug);
        category.setNameEn(nameEn);
        category.setNameAr(nameAr);
        category.setImageUrl(imageUrl);
        category.setIsActive(true);
        category.setSortOrder(sortOrder);
        if (category.getCreatedAt() == null) {
            category.setCreatedAt(LocalDateTime.now());
        }
        return categoryRepository.save(category);
    }

    private void upsertProduct(
            Category category,
            String slug,
            String nameEn,
            String nameAr,
            String descriptionEn,
            String descriptionAr,
            String price,
            List<ColorMedia> media
    ) {
        Product product = productRepository.findBySlug(slug).orElseGet(Product::new);
        product.setSlug(slug);
        product.setCategory(category);
        product.setTitleEn(nameEn);
        product.setTitleAr(nameAr);
        product.setNameEn(nameEn);
        product.setNameAr(nameAr);
        product.setDescriptionEn(descriptionEn);
        product.setDescriptionAr(descriptionAr);
        product.setPrice(new BigDecimal(price));
        product.setActive(true);
        product.setBadge(null);
        product.setVideoUrl(PRODUCT_VIDEO_URL);
        if (product.getCreatedAt() == null) {
            product.setCreatedAt(LocalDateTime.now());
        }
        product.setUpdatedAt(LocalDateTime.now());

        Product saved = productRepository.save(product);
        productImageRepository.deleteByProduct_Id(saved.getId());
        productVariantRepository.deleteByProduct_Id(saved.getId());
        saved.getImages().clear();
        saved.getVariants().clear();

        for (int index = 0; index < media.size(); index++) {
            ColorMedia colorMedia = media.get(index);

            ProductImage image = new ProductImage();
            image.setProduct(saved);
            image.setImageUrl(colorMedia.imageUrl());
            image.setSortOrder(index);
            saved.getImages().add(productImageRepository.save(image));

            for (String size : List.of("XS", "S", "M", "L")) {
                ProductVariant variant = new ProductVariant();
                variant.setProduct(saved);
                variant.setColor(colorMedia.name());
                variant.setColorHex(colorMedia.hex());
                variant.setSize(size);
                variant.setStock(index == 0 ? 14 : 9);
                variant.setImageUrl(colorMedia.imageUrl());
                saved.getVariants().add(productVariantRepository.save(variant));
            }
        }
    }

    private ColorMedia media(String name, String hex, String imageUrl) {
        return new ColorMedia(name, hex, imageUrl);
    }

    private void ensureAllProductsHaveVideo() {
        productRepository.findAll().forEach(product -> {
            if (product.getVideoUrl() == null || product.getVideoUrl().isBlank()) {
                product.setVideoUrl(PRODUCT_VIDEO_URL);
                if (product.getUpdatedAt() == null) {
                    product.setUpdatedAt(LocalDateTime.now());
                }
                productRepository.save(product);
            }
        });
    }

    private record ColorMedia(String name, String hex, String imageUrl) {
    }
}
