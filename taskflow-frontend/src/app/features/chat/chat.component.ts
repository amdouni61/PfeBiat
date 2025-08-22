import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/auth/auth.service';
import { ChatMessage, ChatConversation, SendMessageRequest } from '../../core/models/chat.interface';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatBadgeModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatFormFieldModule
  ],
  template: `
    <div class="chat-container">
      <!-- Chat Sidebar -->
      <div class="chat-sidebar">
        <mat-card class="sidebar-card">
          <mat-card-header>
            <mat-card-title>Conversations</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              @for (conversation of conversations(); track conversation.userId) {
                <mat-list-item 
                  [class.active]="selectedConversation()?.userId === conversation.userId"
                  (click)="selectConversation(conversation)">
                  <div class="conversation-item">
                    <div class="user-info">
                      <span class="user-name">{{ conversation.userName }}</span>
                      <span class="user-email">{{ conversation.userEmail }}</span>
                    </div>
                    <div class="conversation-meta">
                      @if (conversation.unreadCount > 0) {
                        <mat-chip color="accent" class="unread-badge">
                          {{ conversation.unreadCount }}
                        </mat-chip>
                      }
                      @if (conversation.isOnline) {
                        <div class="online-indicator"></div>
                      }
                    </div>
                  </div>
                </mat-list-item>
              }
            </mat-list>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Chat Main Area -->
      <div class="chat-main">
        @if (selectedConversation()) {
          <mat-card class="chat-card">
            <mat-card-header>
              <mat-card-title>
                {{ selectedConversation()?.userName }}
                @if (selectedConversation()?.isOnline) {
                  <span class="online-status">● Online</span>
                }
              </mat-card-title>
              <mat-card-subtitle>{{ selectedConversation()?.userEmail }}</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content class="chat-messages">
              <div class="messages-container" #messagesContainer>
                @for (message of currentMessages(); track message.id) {
                  <div class="message" [class.own-message]="isOwnMessage(message)">
                    <div class="message-content">
                      <div class="message-text">{{ message.content }}</div>
                      <div class="message-time">{{ message.formattedTime }}</div>
                    </div>
                    @if (isOwnMessage(message)) {
                      <div class="message-status">
                        @if (message.isRead) {
                          <mat-icon class="read-icon">done_all</mat-icon>
                        } @else {
                          <mat-icon class="unread-icon">done</mat-icon>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </mat-card-content>

            <mat-card-actions class="chat-input">
              <mat-form-field appearance="outline" class="message-input">
                <input 
                  matInput 
                  [(ngModel)]="newMessage" 
                  placeholder="Type your message..."
                  (keyup.enter)="sendMessage()"
                  (input)="onTyping()">
              </mat-form-field>
              <button 
                mat-raised-button 
                color="primary" 
                (click)="sendMessage()"
                [disabled]="!newMessage.trim()">
                <mat-icon>send</mat-icon>
                Send
              </button>
            </mat-card-actions>
          </mat-card>
        } @else {
          <mat-card class="no-conversation-card">
            <mat-card-content>
              <div class="no-conversation">
                <mat-icon class="chat-icon">chat</mat-icon>
                <h3>Select a conversation to start chatting</h3>
                <p>Choose a user from the sidebar to begin messaging</p>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `,
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  // Signals
  conversations = signal<ChatConversation[]>([]);
  selectedConversation = signal<ChatConversation | null>(null);
  currentMessages = signal<ChatMessage[]>([]);
  newMessage = '';
  typingTimeout: any;

  // Computed values
  currentUser = computed(() => this.authService.getCurrentUser());

  ngOnInit(): void {
    this.loadConversations();
    this.subscribeToMessages();
  }

  ngOnDestroy(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  loadConversations(): void {
    this.chatService.getRecentConversations().subscribe(conversations => {
      this.conversations.set(conversations);
    });
  }

  selectConversation(conversation: ChatConversation): void {
    this.selectedConversation.set(conversation);
    this.loadMessages(conversation.userId);
  }

  loadMessages(userId: number): void {
    const currentUserId = this.currentUser()?.id;
    if (!currentUserId) return;

    this.chatService.getConversation(currentUserId, userId).subscribe(messages => {
      this.currentMessages.set(messages);
      this.scrollToBottom();
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation()) return;

    const currentUserId = this.currentUser()?.id;
    if (!currentUserId) return;

    const request: SendMessageRequest = {
      senderId: currentUserId,
      receiverId: this.selectedConversation()!.userId,
      content: this.newMessage.trim()
    };

    this.chatService.sendMessage(request.receiverId, request.content).subscribe(message => {
      this.currentMessages.update(messages => [...messages, message]);
      this.newMessage = '';
      this.scrollToBottom();
    });
  }

  onTyping(): void {
    if (!this.selectedConversation()) return;

    const currentUserId = this.currentUser()?.id;
    if (!currentUserId) return;

    // Send typing indicator
    this.chatService.sendTypingIndicator(currentUserId, this.selectedConversation()!.userId, true);

    // Clear previous timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Set timeout to stop typing indicator
    this.typingTimeout = setTimeout(() => {
      this.chatService.sendTypingIndicator(currentUserId, this.selectedConversation()!.userId, false);
    }, 1000);
  }

  isOwnMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUser()?.id;
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  private subscribeToMessages(): void {
    this.chatService.messages$.subscribe(message => {
      // Add new message to current conversation if it matches
      if (this.selectedConversation() && 
          (message.senderId === this.selectedConversation()!.userId || 
           message.receiverId === this.selectedConversation()!.userId)) {
        this.currentMessages.update(messages => [...messages, message]);
        this.scrollToBottom();
      }
      
      // Update unread count
      this.loadConversations();
    });
  }
} 