package com.example.taskflow.service;

import com.example.taskflow.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OnlineStatusService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Store online users with their connection info
    private final Map<String, OnlineUserInfo> onlineUsers = new ConcurrentHashMap<>();
    private final Map<String, UserActivityInfo> userActivityHistory = new ConcurrentHashMap<>();

    public void userConnected(String email, String sessionId) {
        OnlineUserInfo userInfo = new OnlineUserInfo();
        userInfo.setEmail(email);
        userInfo.setSessionId(sessionId);
        userInfo.setConnectedAt(LocalDateTime.now());
        userInfo.setStatus("ONLINE");
        userInfo.setLastActivity(LocalDateTime.now());
        
        onlineUsers.put(email, userInfo);
        
        // Update activity history
        updateUserActivity(email, "CONNECTED", "User logged into the system");
        
        // Notify all admins about user connection
        notifyUserStatusChange(email, "ONLINE");
        
        System.out.println("User connected: " + email + " (Session: " + sessionId + ")");
    }

    public void userDisconnected(String email) {
        OnlineUserInfo userInfo = onlineUsers.get(email);
        if (userInfo != null) {
            userInfo.setStatus("OFFLINE");
            userInfo.setDisconnectedAt(LocalDateTime.now());
            
            // Update activity history with last seen
            updateUserActivity(email, "DISCONNECTED", "User logged out of the system");
            
            // Notify all admins about user disconnection
            notifyUserStatusChange(email, "OFFLINE");
            
            // Remove from online users after a delay to show "last seen"
            // In production, you might want to keep this in database
            onlineUsers.remove(email);
            
            System.out.println("User disconnected: " + email);
        }
    }

    public void updateUserActivity(String email, String activityType, String description) {
        UserActivityInfo activityInfo = userActivityHistory.computeIfAbsent(email, k -> new UserActivityInfo());
        activityInfo.setEmail(email);
        activityInfo.setLastActivity(LocalDateTime.now());
        activityInfo.setLastActivityType(activityType);
        activityInfo.setLastActivityDescription(description);
        
        // Update online user's last activity if they're online
        OnlineUserInfo onlineUser = onlineUsers.get(email);
        if (onlineUser != null) {
            onlineUser.setLastActivity(LocalDateTime.now());
        }
        
        // Notify admins about user activity
        notifyUserActivity(email, activityType, description);
    }

    public boolean isUserOnline(String email) {
        return onlineUsers.containsKey(email) && 
               onlineUsers.get(email).getStatus().equals("ONLINE");
    }

    public OnlineUserInfo getOnlineUserInfo(String email) {
        return onlineUsers.get(email);
    }

    public UserActivityInfo getUserActivityInfo(String email) {
        return userActivityHistory.get(email);
    }

    public Map<String, OnlineUserInfo> getAllOnlineUsers() {
        return new ConcurrentHashMap<>(onlineUsers);
    }

    public Map<String, UserActivityInfo> getAllUserActivity() {
        return new ConcurrentHashMap<>(userActivityHistory);
    }

    public String getLastSeenFormatted(String email) {
        UserActivityInfo activityInfo = userActivityHistory.get(email);
        if (activityInfo != null && activityInfo.getLastActivity() != null) {
            LocalDateTime lastActivity = activityInfo.getLastActivity();
            LocalDateTime now = LocalDateTime.now();
            
            long minutesAgo = java.time.Duration.between(lastActivity, now).toMinutes();
            
            if (minutesAgo < 1) {
                return "Just now";
            } else if (minutesAgo < 60) {
                return minutesAgo + " min ago";
            } else if (minutesAgo < 1440) { // 24 hours
                long hoursAgo = minutesAgo / 60;
                return hoursAgo + " hour" + (hoursAgo > 1 ? "s" : "") + " ago";
            } else {
                long daysAgo = minutesAgo / 1440;
                return daysAgo + " day" + (daysAgo > 1 ? "s" : "") + " ago";
            }
        }
        return "Never";
    }

    private void notifyUserStatusChange(String userEmail, String status) {
        OnlineUserInfo userInfo = onlineUsers.get(userEmail);
        if (userInfo != null) {
            // Send to topic that all admins subscribe to
            messagingTemplate.convertAndSend("/topic/user-status", new UserStatusMessage(
                userEmail,
                status,
                userInfo.getConnectedAt(),
                userInfo.getDisconnectedAt(),
                userInfo.getLastActivity()
            ));
        }
    }

    private void notifyUserActivity(String email, String activityType, String description) {
        UserActivityInfo activityInfo = userActivityHistory.get(email);
        if (activityInfo != null) {
            messagingTemplate.convertAndSend("/topic/user-activity", new UserActivityMessage(
                email,
                activityType,
                description,
                activityInfo.getLastActivity()
            ));
        }
    }

    // Inner class for online user information
    public static class OnlineUserInfo {
        private String email;
        private String sessionId;
        private String status;
        private LocalDateTime connectedAt;
        private LocalDateTime disconnectedAt;
        private LocalDateTime lastActivity;

        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public LocalDateTime getConnectedAt() { return connectedAt; }
        public void setConnectedAt(LocalDateTime connectedAt) { this.connectedAt = connectedAt; }
        
        public LocalDateTime getDisconnectedAt() { return disconnectedAt; }
        public void setDisconnectedAt(LocalDateTime disconnectedAt) { this.disconnectedAt = disconnectedAt; }
        
        public LocalDateTime getLastActivity() { return lastActivity; }
        public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
    }

    // New class for user activity tracking
    public static class UserActivityInfo {
        private String email;
        private LocalDateTime lastActivity;
        private String lastActivityType;
        private String lastActivityDescription;

        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public LocalDateTime getLastActivity() { return lastActivity; }
        public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }
        
        public String getLastActivityType() { return lastActivityType; }
        public void setLastActivityType(String lastActivityType) { this.lastActivityType = lastActivityType; }
        
        public String getLastActivityDescription() { return lastActivityDescription; }
        public void setLastActivityDescription(String lastActivityDescription) { this.lastActivityDescription = lastActivityDescription; }
    }

    // Enhanced message class for WebSocket communication
    public static class UserStatusMessage {
        private String userEmail;
        private String status;
        private LocalDateTime connectedAt;
        private LocalDateTime disconnectedAt;
        private LocalDateTime lastActivity;

        public UserStatusMessage(String userEmail, String status, LocalDateTime connectedAt, LocalDateTime disconnectedAt, LocalDateTime lastActivity) {
            this.userEmail = userEmail;
            this.status = status;
            this.connectedAt = connectedAt;
            this.disconnectedAt = disconnectedAt;
            this.lastActivity = lastActivity;
        }

        // Getters
        public String getUserEmail() { return userEmail; }
        public String getStatus() { return status; }
        public LocalDateTime getConnectedAt() { return connectedAt; }
        public LocalDateTime getDisconnectedAt() { return disconnectedAt; }
        public LocalDateTime getLastActivity() { return lastActivity; }
    }

    // New message class for user activity
    public static class UserActivityMessage {
        private String userEmail;
        private String activityType;
        private String description;
        private LocalDateTime timestamp;

        public UserActivityMessage(String userEmail, String activityType, String description, LocalDateTime timestamp) {
            this.userEmail = userEmail;
            this.activityType = activityType;
            this.description = description;
            this.timestamp = timestamp;
        }

        // Getters
        public String getUserEmail() { return userEmail; }
        public String getActivityType() { return activityType; }
        public String getDescription() { return description; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }
} 