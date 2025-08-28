import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, filter } from 'rxjs';
import { ChatMessage, SendMessageRequest, ChatConversation } from '../models/chat.interface';
import { WebSocketService } from './websocket.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private webSocketService = inject(WebSocketService);
  private authService = inject(AuthService);
  
  private readonly API_URL = 'http://localhost:8080/api/chat';
  
  // Subjects for real-time chat updates
  private readonly _messages = new BehaviorSubject<ChatMessage[]>([]);
  private readonly _conversations = new BehaviorSubject<ChatConversation[]>([]);
  private readonly _unreadCount = new BehaviorSubject<number>(0);
  private readonly _typingIndicators = new BehaviorSubject<Map<number, boolean>>(new Map());
  
  // Public observables
  readonly messages$ = this._messages.asObservable();
  readonly conversations$ = this._conversations.asObservable();
  readonly unreadCount$ = this._unreadCount.asObservable();
  readonly typingIndicators$ = this._typingIndicators.asObservable();

  constructor() {
    this.initializeChat();
  }

  private initializeChat(): void {
    // Subscribe to WebSocket chat messages
    this.webSocketService.subscribeToChatMessages()
      .pipe(filter((m: any) => !!m))
      .subscribe(message => {
        this.addMessage(message);
        this.updateUnreadCount();
      });

    // Subscribe to typing indicators
    this.webSocketService.subscribeToTyping()
      .pipe(filter((t: any) => !!t))
      .subscribe(typing => {
        this.updateTypingIndicator(typing);
      });
  }

  // Send a message
  sendMessage(receiverId: number, content: string): Observable<ChatMessage> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const request: SendMessageRequest = {
      senderId: currentUser.id,
      receiverId: receiverId,
      content: content
    };

    return this.http.post<ChatMessage>(`${this.API_URL}/send`, request);
  }

  // Get conversation between two users
  getConversation(user1Id: number, user2Id: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.API_URL}/conversation/${user1Id}/${user2Id}`);
  }

  // Get unread messages for current user
  getUnreadMessages(): Observable<ChatMessage[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return new Observable();
    }
    return this.http.get<ChatMessage[]>(`${this.API_URL}/unread/${currentUser.id}`);
  }

  // Mark message as read
  markMessageAsRead(messageId: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/read/${messageId}`, {});
  }

  // Mark conversation as read
  markConversationAsRead(user1Id: number, user2Id: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/conversation/read/${user1Id}/${user2Id}`, {});
  }

  // Get unread message count
  getUnreadMessageCount(): Observable<number> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return new Observable();
    }
    return this.http.get<number>(`${this.API_URL}/unread-count/${currentUser.id}`);
  }

  // Get recent conversations
  getRecentConversations(): Observable<ChatConversation[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return new Observable();
    }
    return this.http.get<ChatConversation[]>(`${this.API_URL}/recent-conversations/${currentUser.id}`);
  }

  // Send typing indicator
  sendTypingIndicator(receiverId: number, isTyping: boolean): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return;
    }

    this.webSocketService.sendTypingIndicator(currentUser.id, receiverId, isTyping);
  }

  // Private methods for managing local state
  private addMessage(message: ChatMessage): void {
    const currentMessages = this._messages.value;
    currentMessages.push(message);
    this._messages.next([...currentMessages]);
  }

  private updateUnreadCount(): void {
    this.getUnreadMessageCount().subscribe(count => {
      this._unreadCount.next(count);
    });
  }

  private updateTypingIndicator(typing: any): void {
    if (!typing) return;
    const currentIndicators = this._typingIndicators.value;
    currentIndicators.set(typing.senderId, typing.isTyping);
    this._typingIndicators.next(new Map(currentIndicators));
  }

  // Public methods for managing local state
  setMessages(messages: ChatMessage[]): void {
    this._messages.next(messages);
  }

  setConversations(conversations: ChatConversation[]): void {
    this._conversations.next(conversations);
  }

  clearMessages(): void {
    this._messages.next([]);
  }

  // Get current values
  getCurrentMessages(): ChatMessage[] {
    return this._messages.value;
  }

  getCurrentConversations(): ChatConversation[] {
    return this._conversations.value;
  }

  getCurrentUnreadCount(): number {
    return this._unreadCount.value;
  }
} 