package com.example.taskflow.dtos;

import com.example.taskflow.model.enums.UserRole;

public class CreateUserDto {
    private String fullName;
    private String email;
    private String password;
    private UserRole role;
    private String avatarUrl;

    // Default constructor
    public CreateUserDto() {}

    // Constructor with all fields
    public CreateUserDto(String fullName, String email, String password, UserRole role, String avatarUrl) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.avatarUrl = avatarUrl;
    }

    // Getters and Setters
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
} 