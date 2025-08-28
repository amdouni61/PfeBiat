package com.example.taskflow.conrollers;

import com.example.taskflow.service.OnlineStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class OnlineStatusController {

    @Autowired
    private OnlineStatusService onlineStatusService;

    @MessageMapping("/user-status")
    @SendTo("/topic/user-status")
    public OnlineStatusService.UserStatusMessage handleUserStatus(OnlineStatusService.UserStatusMessage message) {
        // Broadcast user status change to all subscribers
        return message;
    }

    @MessageMapping("/get-online-users")
    @SendToUser("/queue/online-users")
    public Map<String, OnlineStatusService.OnlineUserInfo> getOnlineUsers() {
        // Send list of online users to the requesting user
        return onlineStatusService.getAllOnlineUsers();
    }

    @MessageMapping("/user-heartbeat")
    public void handleUserHeartbeat(String userEmail) {
        // Handle user heartbeat to keep them marked as online
        // This can be used to detect if user is still active
        System.out.println("Heartbeat received from user: " + userEmail);
    }
} 