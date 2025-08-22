package com.example.taskflow.service;

import com.example.taskflow.model.User;
import com.example.taskflow.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SessionService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Update user's last activity timestamp
     */
    public void updateUserActivity(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.updateLastActivity();
            userRepository.save(user);
        });
    }

    /**
     * Check if user session is expired
     */
    public boolean isSessionExpired(String email) {
        return userRepository.findByEmail(email)
                .map(User::isSessionExpired)
                .map(expired -> expired)
                .orElse(true);
    }

    /**
     * Get all users with expired sessions
     */
    public List<User> getUsersWithExpiredSessions() {
        return userRepository.findAll().stream()
                .filter(User::isSessionExpired)
                .toList();
    }

    /**
     * Clean up expired sessions (runs every 5 minutes)
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void cleanupExpiredSessions() {
        List<User> expiredUsers = getUsersWithExpiredSessions();
        for (User user : expiredUsers) {
            // Log expired sessions for monitoring
            System.out.println("Session expired for user: " + user.getEmail());
        }
    }

    /**
     * Check if user is hidden/deactivated
     */
    public boolean isUserHidden(String email) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    Boolean isHidden = user.getIsHidden();
                    // Return false if isHidden is null or false, true only if explicitly true
                    return isHidden != null && isHidden;
                })
                .orElse(false); // Return false if user not found (instead of true)
    }
} 