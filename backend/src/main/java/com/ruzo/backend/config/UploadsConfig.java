package com.ruzo.backend.config;

import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class UploadsConfig implements WebMvcConfigurer {

    private final Path uploadsDirectory;

    public UploadsConfig(@Value("${ruzo.uploads.directory:uploads}") String uploadsDirectory) {
        this.uploadsDirectory = Path.of(uploadsDirectory).toAbsolutePath().normalize();
    }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        registry
                .addResourceHandler("/api/uploads/**")
                .addResourceLocations(uploadsDirectory.toUri().toString() + "/")
                .setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic());
    }
}
