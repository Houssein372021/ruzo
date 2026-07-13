package com.ruzo.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "ruzo.demo.seed", havingValue = "true")
public class DemoDataSeeder implements CommandLineRunner {

    @Override
    @Transactional
    public void run(String... args) {
        // Demo product seeding is intentionally disabled while the catalog starts empty.
    }
}
