package com.ruzo.backend.config;

import com.ruzo.backend.entity.Product;
import com.ruzo.backend.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class ProductCategoryBackfill implements CommandLineRunner {

    private final ProductRepository productRepository;

    public ProductCategoryBackfill(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        for (Product product : productRepository.findAll()) {
            if (product.getCategories().isEmpty() && product.getCategory() != null) {
                product.getCategories().add(product.getCategory());
                productRepository.save(product);
            }
        }
    }
}
