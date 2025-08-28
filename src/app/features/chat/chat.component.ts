import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatListModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule
  ],
  template: `
    <div class="chat-container">
      <div class="conversations-sidebar">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Conversations</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              <mat-list-item 
                *ngFor="let conversation of conversations(); let i = index"
                [class.selected]="selectedConversation()?.userId === conversation.userId"
                (click)="selectConversation(conversation)"
                class="conversation-item">
                <mat-icon matListItemIcon>person</mat-icon>
                <div matListItemTitle>{{ conversation.userName }}</div>
                <div matListItemLine>{{ conversation.lastMessage }}</div>
                <span *ngIf="conversation.unreadCount > 0" class="unread-badge">{{ conversation.unreadCount }}</span>
                <mat-divider *ngIf="i < conversations().length - 1"></mat-divider>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="chat-main">
        <mat-card *ngIf="selectedConversation(); else noConversation" class="chat-card">
          <mat-card-header>
            <mat-card-title>{{ selectedConversation()!.userName }}</mat-card-title>
          </mat-card-header>
          <mat-card-content class="messages-container">
            <div 
              *ngFor="let message of currentMessages()" 
              class="message" 
              [class.own-message]="isOwnMessage(message)">
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ message.formattedTime }}</div>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="message-input-container">
            <mat-form-field appearance="outline" class="message-input">
              <input 
                matInput 
                [(ngModel)]="newMessage" 
                placeholder="Type a message..."
                (input)="onTyping()"
                (keyup.enter)="sendMessage()">
            </mat-form-field>
            <button 
              mat-raised-button 
              color="primary" 
              (click)="sendMessage()"
              [disabled]="!newMessage.trim()">
              Send
            </button>
          </mat-card-actions>
        </mat-card>

        <ng-template #noConversation>
          <mat-card class="no-conversation-card">
            <mat-card-content>
              <div class="no-conversation">
                <mat-icon class="chat-icon">chat</mat-icon>
                <h3>Select a conversation to start chatting</h3>
                <p>Choose a user from the sidebar to begin messaging</p>
              </div>
            </mat-card-content>
          </mat-card>
        </ng-template>
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
    this.chatService.sendTypingIndicator(this.selectedConversation()!.userId, true);

    // Clear previous timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Set timeout to stop typing indicator
    this.typingTimeout = setTimeout(() => {
      this.chatService.sendTypingIndicator(this.selectedConversation()!.userId, false);
    }, 1000);
  }

  isOwnMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUser()?.id;
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }

  private subscribeToMessages(): void {
    this.chatService.messages$.subscribe(messages => {
      // messages$ emits ChatMessage[], so we need to handle the array
      if (messages && messages.length > 0) {
        // Get the latest message
        const latestMessage = messages[messages.length - 1];
        
        // Add new message to current conversation if it matches
        if (this.selectedConversation() && 
            (latestMessage.senderId === this.selectedConversation()!.userId || 
             latestMessage.receiverId === this.selectedConversation()!.userId)) {
          this.currentMessages.update(currentMessages => [...currentMessages, latestMessage]);
          this.scrollToBottom();
        }
      }
      
      // Update unread count
      this.loadConversations();
    });
  }
} 