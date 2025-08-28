import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

// WebSocket types
export interface OnlineUserStatus {
  userEmail: string;
  status: 'ONLINE' | 'OFFLINE';
  connectedAt?: string;
  disconnectedAt?: string;
}

export interface OnlineUser {
  email: string;
  fullName: string;
  avatarUrl?: string;
  role?: string;
  status: 'ONLINE' | 'OFFLINE';
  lastSeen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private authService = inject(AuthService);
  
  private socket: any = null;
  private stompClient: any = null;
  private isConnected = false;
  
  // Streams for chat features
  private readonly chatMessageSubject = new BehaviorSubject<any | null>(null);
  private readonly typingSubject = new BehaviorSubject<any | null>(null);
  
  // Subjects for real-time updates
  private readonly _onlineUsers = new BehaviorSubject<OnlineUser[]>([]);
  private readonly _userStatusUpdates = new BehaviorSubject<OnlineUserStatus | null>(null);
  
  // Public observables
  readonly onlineUsers$ = this._onlineUsers.asObservable();
  readonly userStatusUpdates$ = this._userStatusUpdates.asObservable();

  constructor() {
    // Initialize WebSocket connection when service is created
    this.connect();
  }

  connect(): void {
    if (this.isConnected) return;

    try {
      // Create SockJS connection
      const SockJS = (window as any).SockJS;
      if (!SockJS) {
        console.error('SockJS not available');
        return;
      }

      this.socket = new SockJS('http://localhost:8080/ws');
      this.stompClient = (window as any).webstomp.over(this.socket);

      const token = (this.authService as any).getToken?.();
      const headers: any = token ? { Authorization: `Bearer ${token}` } : {};

      this.stompClient.connect(headers, (frame: any) => {
        console.log('Connected to WebSocket:', frame);
        this.isConnected = true;
        
        // Subscribe to user status updates
        this.subscribeToUserStatus();
        
        // Subscribe to online users list
        this.subscribeToOnlineUsers();
        
        // Subscribe to chat message queue
        this.stompClient.subscribe('/user/queue/chat-messages', (message: any) => {
          try {
            const chatMessage = JSON.parse(message.body);
            this.chatMessageSubject.next(chatMessage);
          } catch (error) {
            console.error('Error parsing chat message:', error);
          }
        });
        
        // Subscribe to typing indicators
        this.stompClient.subscribe('/user/queue/typing', (message: any) => {
          try {
            const typingInfo = JSON.parse(message.body);
            this.typingSubject.next(typingInfo);
          } catch (error) {
            console.error('Error parsing typing indicator:', error);
          }
        });
        
        // Send initial connection message
        this.sendUserConnection();
        
        // Start heartbeat to keep connection alive
        this.startHeartbeat();
      }, (error: any) => {
        console.error('WebSocket connection error:', error);
        this.isConnected = false;
        // Clear subscriptions so observers don’t hang
        this._onlineUsers.next([]);
        this._userStatusUpdates.next(null);
        // Retry connection after delay
        setTimeout(() => this.connect(), 3000);
      });

    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
    this.isConnected = false;
  }

  private subscribeToUserStatus(): void {
    this.stompClient.subscribe('/topic/user-status', (message: any) => {
      try {
        const statusUpdate: OnlineUserStatus = JSON.parse(message.body);
        this._userStatusUpdates.next(statusUpdate);
        
        // Update online users list
        this.updateOnlineUsersList(statusUpdate);
        
        console.log('User status update:', statusUpdate);
      } catch (error) {
        console.error('Error parsing user status message:', error);
      }
    });
  }

  private subscribeToOnlineUsers(): void {
    this.stompClient.subscribe('/queue/online-users', (message: any) => {
      try {
        const onlineUsers = JSON.parse(message.body);
        this.updateOnlineUsersFromServer(onlineUsers);
      } catch (error) {
        console.error('Error parsing online users message:', error);
      }
    });
  }

  private sendUserConnection(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && this.isConnected) {
      this.stompClient.send('/app/user-heartbeat', {}, currentUser.email);
    }
  }

  private startHeartbeat(): void {
    // Send heartbeat every 30 seconds to keep connection alive
    setInterval(() => {
      if (this.isConnected) {
        this.sendUserConnection();
      }
    }, 30000);
  }

  private updateOnlineUsersList(statusUpdate: OnlineUserStatus): void {
    const currentUsers = this._onlineUsers.value;
    const userIndex = currentUsers.findIndex(user => user.email === statusUpdate.userEmail);
    
    if (statusUpdate.status === 'ONLINE') {
      if (userIndex === -1) {
        // Add new online user
        const newUser: OnlineUser = {
          email: statusUpdate.userEmail,
          fullName: statusUpdate.userEmail, // Will be updated with real data
          status: 'ONLINE',
          lastSeen: statusUpdate.connectedAt
        };
        currentUsers.push(newUser);
      } else {
        // Update existing user status
        currentUsers[userIndex].status = 'ONLINE';
        currentUsers[userIndex].lastSeen = statusUpdate.connectedAt;
      }
    } else {
      // User went offline
      if (userIndex !== -1) {
        currentUsers[userIndex].status = 'OFFLINE';
        currentUsers[userIndex].lastSeen = statusUpdate.disconnectedAt;
      }
    }
    
    this._onlineUsers.next([...currentUsers]);
  }

  private updateOnlineUsersFromServer(onlineUsersData: any): void {
    // Convert server data to frontend format
    const onlineUsers: OnlineUser[] = Object.values(onlineUsersData).map((user: any) => ({
      email: user.email,
      fullName: user.email, // Will be updated with real user data
      status: user.status,
      lastSeen: user.connectedAt
    }));
    
    this._onlineUsers.next(onlineUsers);
  }

  // Public method to request online users list
  requestOnlineUsers(): void {
    if (this.isConnected) {
      this.stompClient.send('/app/get-online-users', {}, '');
    }
  }

  // Chat functionality
  subscribeToChatMessages(): Observable<any> {
    // Merge personal queue and per-user topic fallback
    const base$ = this.chatMessageSubject.asObservable();
    const topic$ = new Observable(observer => {
      // Subscribe to per-user topic when connected
      const currentUser = this.authService.getCurrentUser();
      if (!this.isConnected || !currentUser) { observer.complete(); return; }
      const sub = this.stompClient.subscribe(`/topic/chat-messages.${currentUser.id}`, (message: any) => {
        try { observer.next(JSON.parse(message.body)); } catch {}
      });
      return () => { try { sub.unsubscribe(); } catch {} };
    });
    return base$;
  }

  subscribeToTyping(): Observable<any> {
    return this.typingSubject.asObservable();
  }

  sendTypingIndicator(senderId: number, receiverId: number, isTyping: boolean): void {
    if (this.isConnected) {
      this.stompClient.send('/app/typing', {}, JSON.stringify({
        senderId: senderId,
        receiverId: receiverId,
        isTyping: isTyping
      }));
    }
  }

  // Method to check if WebSocket is connected
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
} 