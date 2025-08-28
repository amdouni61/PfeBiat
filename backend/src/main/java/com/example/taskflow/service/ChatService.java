package com.example.taskflow.service;

import com.example.taskflow.dtos.ChatMessageDTO;
import com.example.taskflow.model.ChatMessage;
import com.example.taskflow.model.User;
import com.example.taskflow.repositories.ChatMessageRepository;
import com.example.taskflow.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public ChatMessageDTO sendMessage(Long senderId, Long receiverId, String content) {
        Optional<User> senderOpt = userRepository.findById(senderId);
        Optional<User> receiverOpt = userRepository.findById(receiverId);
        
        if (senderOpt.isEmpty() || receiverOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid sender or receiver ID");
        }
        
        User sender = senderOpt.get();
        User receiver = receiverOpt.get();
        
        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setMessageType(ChatMessage.MessageType.TEXT);
        message.setRead(false);
        message.setCreatedAt(LocalDateTime.now());
        
        ChatMessage savedMessage = chatMessageRepository.save(message);
        
        // Convert to DTO
        ChatMessageDTO messageDTO = ChatMessageDTO.fromEntity(savedMessage);
        
        // Send real-time message via WebSocket
        sendRealTimeMessage(messageDTO);
        
        // Update user activity
        updateUserActivity(sender.getEmail(), "SENT_MESSAGE", "Sent a message to " + receiver.getFullName());
        
        return messageDTO;
    }

    public List<ChatMessageDTO> getConversation(Long user1Id, Long user2Id) {
        Optional<User> user1Opt = userRepository.findById(user1Id);
        Optional<User> user2Opt = userRepository.findById(user2Id);
        
        if (user1Opt.isEmpty() || user2Opt.isEmpty()) {
            throw new IllegalArgumentException("Invalid user ID");
        }
        
        List<ChatMessage> messages = chatMessageRepository.findConversation(user1Opt.get(), user2Opt.get());
        return messages.stream()
                .map(ChatMessageDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ChatMessageDTO> getUnreadMessages(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid user ID");
        }
        
        List<ChatMessage> messages = chatMessageRepository.findUnreadMessages(userOpt.get());
        return messages.stream()
                .map(ChatMessageDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public void markMessageAsRead(Long messageId) {
        Optional<ChatMessage> messageOpt = chatMessageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            ChatMessage message = messageOpt.get();
            message.setRead(true);
            message.setReadAt(LocalDateTime.now());
            chatMessageRepository.save(message);
        }
    }

    public void markConversationAsRead(Long user1Id, Long user2Id) {
        Optional<User> user1Opt = userRepository.findById(user1Id);
        Optional<User> user2Opt = userRepository.findById(user2Id);
        
        if (user1Opt.isEmpty() || user2Opt.isEmpty()) {
            return;
        }
        
        List<ChatMessage> unreadMessages = chatMessageRepository.findUnreadMessagesFromSender(user1Opt.get(), user2Opt.get());
        unreadMessages.forEach(message -> {
            message.setRead(true);
            message.setReadAt(LocalDateTime.now());
        });
        chatMessageRepository.saveAll(unreadMessages);
    }

    public long getUnreadMessageCount(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return 0;
        }
        return chatMessageRepository.countUnreadMessages(userOpt.get());
    }

    public List<Map<String, Object>> getRecentConversations(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return List.of();
        }
        
        User currentUser = userOpt.get();
        
        // First, try to get users with existing conversations
        List<User> existingConversations = chatMessageRepository.findRecentConversations(currentUser);
        
        // If no existing conversations, return all other users (excluding current user)
        List<User> allUsers;
        if (existingConversations.isEmpty()) {
            allUsers = userRepository.findAll().stream()
                    .filter(user -> !user.getId().equals(userId)
                            && !Boolean.TRUE.equals(user.getIsHidden()))
                    .collect(Collectors.toList());
        } else {
            allUsers = existingConversations;
        }
        
        // Convert to conversation format
        return allUsers.stream().map(user -> {
            Map<String, Object> conversation = new HashMap<>();
            conversation.put("userId", user.getId());
            conversation.put("userEmail", user.getEmail());
            conversation.put("userName", user.getFullName());
            conversation.put("userAvatar", user.getAvatarUrl());
            conversation.put("lastMessage", "");
            conversation.put("lastMessageTime", "");
            conversation.put("unreadCount", 0);
            conversation.put("isOnline", false);
            return conversation;
        }).collect(Collectors.toList());
    }

    private void sendRealTimeMessage(ChatMessageDTO message) {
        // Send to specific user's private queue (if user destinations are configured)
        try {
            messagingTemplate.convertAndSendToUser(
                message.getReceiverEmail(),
                "/queue/chat-messages",
                message
            );
            messagingTemplate.convertAndSendToUser(
                message.getSenderEmail(),
                "/queue/chat-messages",
                message
            );
        } catch (Exception ignored) {
        }

        // Fallback/topic-based routing by user id (works without authenticated user destinations)
        try {
            messagingTemplate.convertAndSend(
                "/topic/chat-messages." + message.getReceiverId(),
                message
            );
            messagingTemplate.convertAndSend(
                "/topic/chat-messages." + message.getSenderId(),
                message
            );
        } catch (Exception ignored) {
        }
    }

    private void updateUserActivity(String email, String activityType, String description) {
        // This will be handled by the OnlineStatusService
        // We can inject it here if needed
    }
} 