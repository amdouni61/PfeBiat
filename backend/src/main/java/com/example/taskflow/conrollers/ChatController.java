package com.example.taskflow.conrollers;

import com.example.taskflow.dtos.ChatMessageDTO;
import com.example.taskflow.model.User;
import com.example.taskflow.service.ChatService;
import com.example.taskflow.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:4200")
public class ChatController {

    @Autowired
    private ChatService chatService;
    
    @Autowired
    private UserService userService;

    // REST endpoints for chat functionality
    @PostMapping("/send")
    public ResponseEntity<ChatMessageDTO> sendMessage(@RequestBody Map<String, Object> request) {
        try {
            Long senderId = Long.parseLong(request.get("senderId").toString());
            Long receiverId = Long.parseLong(request.get("receiverId").toString());
            String content = request.get("content").toString();
            
            ChatMessageDTO message = chatService.sendMessage(senderId, receiverId, content);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/conversation/{user1Id}/{user2Id}")
    public ResponseEntity<List<ChatMessageDTO>> getConversation(
            @PathVariable Long user1Id, 
            @PathVariable Long user2Id) {
        try {
            List<ChatMessageDTO> messages = chatService.getConversation(user1Id, user2Id);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<ChatMessageDTO>> getUnreadMessages(@PathVariable Long userId) {
        try {
            List<ChatMessageDTO> messages = chatService.getUnreadMessages(userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/read/{messageId}")
    public ResponseEntity<Void> markMessageAsRead(@PathVariable Long messageId) {
        try {
            chatService.markMessageAsRead(messageId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/conversation/read/{user1Id}/{user2Id}")
    public ResponseEntity<Void> markConversationAsRead(
            @PathVariable Long user1Id, 
            @PathVariable Long user2Id) {
        try {
            chatService.markConversationAsRead(user1Id, user2Id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Long> getUnreadMessageCount(@PathVariable Long userId) {
        try {
            long count = chatService.getUnreadMessageCount(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/recent-conversations/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getRecentConversations(@PathVariable Long userId) {
        try {
            List<Map<String, Object>> conversations = chatService.getRecentConversations(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // WebSocket message handlers
    @MessageMapping("/chat-message")
    @SendToUser("/queue/chat-messages")
    public ChatMessageDTO handleChatMessage(@Payload Map<String, Object> message) {
        try {
            Long senderId = Long.parseLong(message.get("senderId").toString());
            Long receiverId = Long.parseLong(message.get("receiverId").toString());
            String content = message.get("content").toString();
            
            return chatService.sendMessage(senderId, receiverId, content);
        } catch (Exception e) {
            // Return error message
            return new ChatMessageDTO();
        }
    }

    @MessageMapping("/typing")
    @SendToUser("/queue/typing")
    public Map<String, Object> handleTyping(@Payload Map<String, Object> typingInfo) {
        // Notify other user that someone is typing
        return Map.of(
            "senderId", typingInfo.get("senderId"),
            "receiverId", typingInfo.get("receiverId"),
            "isTyping", typingInfo.get("isTyping")
        );
    }
} 