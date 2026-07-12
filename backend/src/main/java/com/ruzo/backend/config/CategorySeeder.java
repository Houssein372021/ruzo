package com.ruzo.backend.config;

import com.ruzo.backend.entity.Category;
import com.ruzo.backend.repository.CategoryRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CategorySeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public CategorySeeder(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        upsertCategory("sets", null, "Sets", "\u0627\u0644\u0623\u0637\u0642\u0645", "/categories/sets.png", 10);
        upsertCategory(
                "sport-bras",
                "sports-bras",
                "Sport Bras",
                "\u062d\u0645\u0627\u0644\u0627\u062a \u0631\u064a\u0627\u0636\u064a\u0629",
                "/categories/sports-bras.png",
                20
        );
        upsertCategory("bottoms", null, "Bottoms", "\u0627\u0644\u0633\u0631\u0627\u0648\u064a\u0644", "/categories/bottoms.png", 30);
    }

    private void upsertCategory(
            String slug,
            String legacySlug,
            String nameEn,
            String nameAr,
            String imageUrl,
            int sortOrder
    ) {
        Optional<Category> legacyCategory = legacySlug == null
                ? Optional.empty()
                : categoryRepository.findBySlug(legacySlug);
        Category category = categoryRepository.findBySlug(slug)
                .or(() -> legacyCategory)
                .orElseGet(Category::new);

        category.setSlug(slug);
        category.setNameEn(nameEn);
        category.setNameAr(nameAr);
        category.setImageUrl(imageUrl);
        category.setIsActive(true);
        category.setSortOrder(sortOrder);
        if (category.getCreatedAt() == null) {
            category.setCreatedAt(LocalDateTime.now());
        }

        categoryRepository.save(category);
    }
}
