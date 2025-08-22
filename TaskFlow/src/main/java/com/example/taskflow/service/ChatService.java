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
import java.util.List;
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

    public List<User> getRecentConversations(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return List.of();
        }
        return chatMessageRepository.findRecentConversations(userOpt.get());
    }

    private void sendRealTimeMessage(ChatMessageDTO message) {
        // Send to specific user's private queue
        messagingTemplate.convertAndSendToUser(
            message.getReceiverEmail(),
            "/queue/chat-messages",
            message
        );
        
        // Also send to sender for confirmation
        messagingTemplate.convertAndSendToUser(
            message.getSenderEmail(),
            "/queue/chat-messages",
            message
        );
    }

    private void updateUserActivity(String email, String activityType, String description) {
        // This will be handled by the OnlineStatusService
        // We can inject it here if needed
    }
} 