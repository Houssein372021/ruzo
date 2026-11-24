package com.ruzo.backend.controller;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin/uploads")
public class UploadController {

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private static final Set<String> ALLOWED_VIDEO_EXTENSIONS = Set.of("mp4", "webm");

    private final Path uploadsDirectory;

    public UploadController(@Value("${ruzo.uploads.directory:uploads}") String uploadsDirectory) {
        this.uploadsDirectory = Path.of(uploadsDirectory).toAbsolutePath().normalize();
    }

    @PostMapping("/images")
    @ResponseStatus(HttpStatus.CREATED)
    public UploadResponse uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required.");
        }

        return new UploadResponse(storeFile(file, ALLOWED_IMAGE_EXTENSIONS, "image/"));
    }

    @PostMapping("/media")
    @ResponseStatus(HttpStatus.CREATED)
    public MediaUploadResponse uploadMedia(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Media file is required.");
        }

        String contentType = normalizedContentType(file);
        if (contentType.startsWith("image/")) {
            return new MediaUploadResponse(
                    storeFile(file, ALLOWED_IMAGE_EXTENSIONS, "image/"),
                    "IMAGE",
                    file.getOriginalFilename());
        }
        if (contentType.startsWith("video/")) {
            return new MediaUploadResponse(
                    storeFile(file, ALLOWED_VIDEO_EXTENSIONS, "video/"),
                    "VIDEO",
                    file.getOriginalFilename());
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image and video files are allowed.");
    }

    private String storeFile(MultipartFile file, Set<String> allowedExtensions, String requiredContentTypePrefix) {
        String contentType = normalizedContentType(file);
        if (!contentType.startsWith(requiredContentTypePrefix)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid media type.");
        }

        String extension = extensionFrom(file.getOriginalFilename());
        if (!allowedExtensions.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported media format.");
        }

        try {
            Files.createDirectories(uploadsDirectory);
            String fileName = UUID.randomUUID() + "." + extension;
            Path target = uploadsDirectory.resolve(fileName).normalize();

            if (!target.startsWith(uploadsDirectory)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/api/uploads/" + fileName;
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to save media.");
        }
    }

    private String normalizedContentType(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType == null ? "" : contentType.toLowerCase(Locale.ROOT);
    }

    private String extensionFrom(String fileName) {
        if (fileName == null || fileName.isBlank() || !fileName.contains(".")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image extension is required.");
        }

        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }

    public record UploadResponse(String url) {
    }

    public record MediaUploadResponse(String url, String mediaType, String originalFileName) {
    }
}
