export interface ChatMessage {
  id: number;
  senderId: number;
  senderEmail: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: number;
  receiverEmail: string;
  receiverName: string;
  content: string;
  messageType: MessageType;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  formattedTime: string;
}

export interface SendMessageRequest {
  senderId: number;
  receiverId: number;
  content: string;
}

export interface ChatConversation {
  userId: number;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline: boolean;
}

export type MessageType = 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM';

export interface TypingIndicator {
  senderId: number;
  receiverId: number;
  isTyping: boolean;
} 