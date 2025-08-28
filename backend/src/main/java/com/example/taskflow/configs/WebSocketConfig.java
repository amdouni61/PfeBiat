package com.example.taskflow.configs;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired(required = false)
    private ChannelInterceptor stompAuthInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple message broker for sending messages to clients
        config.enableSimpleBroker("/topic", "/queue");
        // Set application destination prefix for client messages
        config.setApplicationDestinationPrefixes("/app");
        // Set user destination prefix for private messages
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register STOMP endpoints
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        if (stompAuthInterceptor != null) {
            registration.interceptors(stompAuthInterceptor);
        }
    }
} 