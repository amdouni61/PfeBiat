package com.example.taskflow.dtos;

import com.example.taskflow.model.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private Long id;
    private Long senderId;
    private String senderEmail;
    private String senderName;
    private String senderAvatar;
    private Long receiverId;
    private String receiverEmail;
    private String receiverName;
    private String content;
    private ChatMessage.MessageType messageType;
    private boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private String formattedTime;
    
    public static ChatMessageDTO fromEntity(ChatMessage message) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(message.getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderEmail(message.getSender().getEmail());
        dto.setSenderName(message.getSender().getFullName());
        dto.setSenderAvatar(message.getSender().getAvatarUrl());
        dto.setReceiverId(message.getReceiver().getId());
        dto.setReceiverEmail(message.getReceiver().getEmail());
        dto.setReceiverName(message.getReceiver().getFullName());
        dto.setContent(message.getContent());
        dto.setMessageType(message.getMessageType());
        dto.setRead(message.isRead());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setReadAt(message.getReadAt());
        
        // Format time for display
        if (message.getCreatedAt() != null) {
            dto.setFormattedTime(formatTime(message.getCreatedAt()));
        }
        
        return dto;
    }
    
    private static String formatTime(LocalDateTime time) {
        LocalDateTime now = LocalDateTime.now();
        long minutesAgo = java.time.Duration.between(time, now).toMinutes();
        
        if (minutesAgo < 1) {
            return "Just now";
        } else if (minutesAgo < 60) {
            return minutesAgo + "m ago";
        } else if (minutesAgo < 1440) { // 24 hours
            long hoursAgo = minutesAgo / 60;
            return hoursAgo + "h ago";
        } else {
            return time.format(java.time.format.DateTimeFormatter.ofPattern("MMM dd"));
        }
    }
} 