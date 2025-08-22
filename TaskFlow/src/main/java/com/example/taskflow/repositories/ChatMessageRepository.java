package com.example.taskflow.repositories;

import com.example.taskflow.model.ChatMessage;
import com.example.taskflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // Find conversation between two users
    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1) " +
           "ORDER BY m.createdAt ASC")
    List<ChatMessage> findConversation(@Param("user1") User user1, @Param("user2") User user2);
    
    // Find unread messages for a user
    @Query("SELECT m FROM ChatMessage m WHERE m.receiver = :user AND m.isRead = false")
    List<ChatMessage> findUnreadMessages(@Param("user") User user);
    
    // Find unread messages from a specific sender
    @Query("SELECT m FROM ChatMessage m WHERE m.receiver = :receiver AND m.sender = :sender AND m.isRead = false")
    List<ChatMessage> findUnreadMessagesFromSender(@Param("receiver") User receiver, @Param("sender") User sender);
    
    // Count unread messages for a user
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.receiver = :user AND m.isRead = false")
    long countUnreadMessages(@Param("user") User user);
    
    // Find recent conversations for a user
    @Query("SELECT DISTINCT m.sender FROM ChatMessage m WHERE m.receiver = :user " +
           "UNION " +
           "SELECT DISTINCT m.receiver FROM ChatMessage m WHERE m.sender = :user")
    List<User> findRecentConversations(@Param("user") User user);
} 