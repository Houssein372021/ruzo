package com.ruzo.backend.controller;

import com.ruzo.backend.entity.Category;
import com.ruzo.backend.repository.CategoryRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<Category> getCategories() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "sortOrder")).stream()
                .filter(category -> category.getIsActive() == null || category.getIsActive())
                .toList();
    }
}
