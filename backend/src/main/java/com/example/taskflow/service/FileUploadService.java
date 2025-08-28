package com.example.taskflow.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.max-size:10485760}") // 10MB default
    private long maxFileSize;

    public FileUploadResult uploadFile(MultipartFile file) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum limit of " + (maxFileSize / 1024 / 1024) + "MB");
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        // Save file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return file information
        return new FileUploadResult(
            uniqueFilename,
            originalFilename,
            file.getSize(),
            file.getContentType(),
            filePath.toString()
        );
    }

    public void deleteFile(String filename) throws IOException {
        Path filePath = Paths.get(uploadDir, filename);
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    public static class FileUploadResult {
        private final String filename;
        private final String originalFilename;
        private final long size;
        private final String contentType;
        private final String filePath;

        public FileUploadResult(String filename, String originalFilename, long size, String contentType, String filePath) {
            this.filename = filename;
            this.originalFilename = originalFilename;
            this.size = size;
            this.contentType = contentType;
            this.filePath = filePath;
        }

        // Getters
        public String getFilename() { return filename; }
        public String getOriginalFilename() { return originalFilename; }
        public long getSize() { return size; }
        public String getContentType() { return contentType; }
        public String getFilePath() { return filePath; }
    }
} 