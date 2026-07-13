package com.ruzo.backend.config;

import com.ruzo.backend.entity.Category;
import com.ruzo.backend.repository.CategoryRepository;
import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "ruzo.category.seed", havingValue = "true")
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CategorySeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public CategorySeeder(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        upsertCategory("sets", "Sets", "\u0627\u0644\u0623\u0637\u0642\u0645", 10);
        upsertCategory("dresses", "Dresses", "\u0627\u0644\u0641\u0633\u0627\u062a\u064a\u0646", 20);
        upsertCategory("bottoms", "Bottoms", "\u0627\u0644\u0633\u0631\u0627\u0648\u064a\u0644", 30);
        upsertCategory("tops", "Tops", "\u0627\u0644\u0642\u0645\u0635\u0627\u0646", 40);
        upsertCategory("outerwear", "Outerwear", "\u0627\u0644\u0645\u0644\u0627\u0628\u0633 \u0627\u0644\u062e\u0627\u0631\u062c\u064a\u0629", 50);
    }

    private void upsertCategory(
            String slug,
            String nameEn,
            String nameAr,
            int sortOrder
    ) {
        Category category = categoryRepository.findBySlug(slug).orElseGet(Category::new);

        category.setSlug(slug);
        category.setNameEn(nameEn);
        category.setNameAr(nameAr);
        category.setImageUrl(null);
        category.setIsActive(true);
        category.setSortOrder(sortOrder);
        if (category.getCreatedAt() == null) {
            category.setCreatedAt(LocalDateTime.now());
        }

        categoryRepository.save(category);
    }
}
