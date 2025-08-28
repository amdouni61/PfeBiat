package com.example.taskflow.configs;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class FileStorageConfig implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        // Create uploads directory if it doesn't exist
        Path uploadsDir = Paths.get("uploads");
        if (!Files.exists(uploadsDir)) {
            Files.createDirectories(uploadsDir);
        }
        
        // Create avatars subdirectory
        Path avatarsDir = uploadsDir.resolve("avatars");
        if (!Files.exists(avatarsDir)) {
            Files.createDirectories(avatarsDir);
        }
        
        System.out.println("✅ File storage directories initialized");
    }
}
