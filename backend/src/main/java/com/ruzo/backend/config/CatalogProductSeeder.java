package com.ruzo.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
@ConditionalOnProperty(name = "ruzo.catalog.seed", havingValue = "true")
public class CatalogProductSeeder implements CommandLineRunner {

    @Override
    @Transactional
    public void run(String... args) {
        // Product seeding is intentionally disabled while the catalog starts empty.
    }
}
