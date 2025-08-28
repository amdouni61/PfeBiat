package com.example.taskflow.service;

import com.example.taskflow.model.enums.UserRole;

public interface EmailService {
    void sendUserCredentials(String email, String password, String fullName, UserRole role);
    void sendPasswordReset(String email, String resetToken);
    void sendTaskNotification(String email, String taskTitle, String message);
} 