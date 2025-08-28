package com.example.taskflow.service.imp;

import com.example.taskflow.service.FileService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    private static final String UPLOAD_BASE_DIR = "uploads";

    @Override
    public String uploadFile(MultipartFile file, String directory) {
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path uploadDir = Paths.get(UPLOAD_BASE_DIR, directory);
            
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            
            Path filePath = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            return "/" + UPLOAD_BASE_DIR + "/" + directory + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + file.getOriginalFilename(), e);
        }
    }

    @Override
    public void deleteFile(String filePath) {
        try {
            if (filePath != null && filePath.startsWith("/" + UPLOAD_BASE_DIR)) {
                Path path = Paths.get(filePath.substring(1));
                if (Files.exists(path)) {
                    Files.delete(path);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + filePath, e);
        }
    }

    @Override
    public boolean fileExists(String filePath) {
        if (filePath == null || !filePath.startsWith("/" + UPLOAD_BASE_DIR)) {
            return false;
        }
        Path path = Paths.get(filePath.substring(1));
        return Files.exists(path);
    }
}
