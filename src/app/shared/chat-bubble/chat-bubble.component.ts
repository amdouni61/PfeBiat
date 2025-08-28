import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { ChatService } from '../../core/services/chat.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/auth/auth.service';
import { ChatConversation, ChatMessage } from '../../core/models/chat.interface';

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatCardModule, MatListModule, MatSnackBarModule],
  template: `
    <button 
      class="chat-fab" 
      mat-fab 
      color="primary" 
      aria-label="Open chat"
      (click)="toggle()">
      <span class="badge" *ngIf="unread() > 0">{{ unread() }}</span>
      <mat-icon>{{ opened() ? 'close' : 'chat' }}</mat-icon>
    </button>

    <div class="chat-panel" *ngIf="opened()">
      <mat-card class="panel-card">
        <div class="panel-header">
          <span class="title">Chat</span>
          <span class="spacer"></span>
          <button mat-icon-button (click)="toggle()"><mat-icon>close</mat-icon></button>
        </div>
        <div class="panel-body">
          <div class="panel-sidebar">
            <mat-list>
              <mat-list-item 
                *ngFor="let c of conversations(); let i = index"
                [class.selected]="selected()?.userId === c.userId"
                (click)="select(c)">
                <span class="status-dot" [class.online]="isOnline(c.userEmail)"></span>
                <div matListItemTitle class="name">{{ c.userName }}</div>
                <div matListItemLine class="preview">{{ c.lastMessage }}</div>
                <span *ngIf="c.unreadCount > 0" class="unread">{{ c.unreadCount }}</span>
              </mat-list-item>
            </mat-list>
          </div>
          <div class="panel-chat" *ngIf="selected(); else empty">
            <div class="messages" #messagesContainer>
              <div 
                *ngFor="let m of messages()" 
                class="msg" 
                [class.own]="isOwn(m)">
                <div class="bubble">
                  <div class="text">{{ m.content }}</div>
                  <div class="time">{{ m.formattedTime }}</div>
                </div>
              </div>
            </div>
            <div class="input">
              <input 
                [(ngModel)]="draft" 
                type="text" 
                placeholder="Type a message..." 
                (input)="onTyping()"
                (keyup.enter)="send()" />
              <button mat-raised-button color="primary" (click)="send()" [disabled]="!draft.trim()">Send</button>
            </div>
          </div>
          <ng-template #empty>
            <div class="empty">Select a conversation</div>
          </ng-template>
        </div>
      </mat-card>
    </div>
  `,
  styleUrls: ['./chat-bubble.component.scss']
})
export class ChatBubbleComponent implements OnInit, OnDestroy {
  private chat = inject(ChatService);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private ws = inject(WebSocketService);
  onlineEmails = signal<Set<string>>(new Set());

  opened = signal(false);
  conversations = signal<ChatConversation[]>([]);
  selected = signal<ChatConversation | null>(null);
  messages = signal<ChatMessage[]>([]);
  draft = '';
  typingTimer: any;
  unread = signal(0);

  currentUser = computed(() => this.auth.getCurrentUser());
  private incomingAudio = new Audio('assets/sounds/incoming.mp3');

  ngOnInit(): void {
    // Online users list (bulk)
    this.ws.onlineUsers$.subscribe(users => {
      const emails = new Set<string>();
      users.forEach(u => { if (u.status === 'ONLINE') emails.add(u.email); });
      this.onlineEmails.set(emails);
    });
    // Live status updates (incremental)
    this.ws.userStatusUpdates$.subscribe(update => {
      if (!update) return;
      const set = new Set(this.onlineEmails());
      if (update.status === 'ONLINE') set.add(update.userEmail);
      else set.delete(update.userEmail);
      this.onlineEmails.set(set);
    });

    // Track online users for status indicator
    // Optional: if WebSocketService exposes online users list
    // Fallback: keep empty set if not available
    try {
      (window as any).onlineUsersSub = (window as any).onlineUsersSub || null;
    } catch {}

    this.loadConversations();
    this.chat.messages$.subscribe(arr => {
      if (!arr || arr.length === 0) return;
      const latest = arr[arr.length - 1];
      if (!latest) return;
      if (this.selected() && (latest.senderId === this.selected()!.userId || latest.receiverId === this.selected()!.userId)) {
        this.messages.update(prev => [...prev, latest]);
        this.scrollToBottom();
      } else {
        // Bump unread count if message from other user and panel closed/not active
        const myId = this.currentUser()?.id;
        if (myId && latest.receiverId === myId && (!this.opened() || !this.selected() || this.selected()!.userId !== latest.senderId)) {
          this.unread.update(n => n + 1);
          // play sound (non-blocking)
          try { this.incomingAudio.play().catch(()=>{}); } catch {}
          this.snack.open('New message', 'Open', { duration: 3000 })
            .onAction().subscribe(() => {
              this.opened.set(true);
              // Optionally auto-select sender conversation after opening
              const conv = this.conversations().find(c => c.userId === latest.senderId);
              if (conv) this.select(conv);
            });
          // Move sender conversation to top if exists
          const list = this.conversations();
          const idx = list.findIndex(c => c.userId === latest.senderId);
          if (idx !== -1) {
            const [item] = list.splice(idx, 1);
            list.unshift({ ...item, lastMessage: latest.content, unreadCount: (item.unreadCount || 0) + 1 });
            this.conversations.set([...list]);
          }
        }
      }
    });
    // Periodically sync unread from backend
    this.chat.getUnreadMessageCount().subscribe(count => this.unread.set(count as unknown as number));
  }

  ngOnDestroy(): void {
    if (this.typingTimer) clearTimeout(this.typingTimer);
  }

  toggle(): void {
    this.opened.update(v => !v);
    if (this.opened()) {
      // Refresh conversations and unread count when opening
      this.loadConversations();
      this.chat.getUnreadMessageCount().subscribe(count => this.unread.set(count as unknown as number));
    }
  }

  loadConversations(): void {
    this.chat.getRecentConversations().subscribe(list => this.conversations.set(list));
  }

  select(c: ChatConversation): void {
    this.selected.set(c);
    const myId = this.currentUser()?.id;
    if (!myId) return;
    this.chat.getConversation(myId, c.userId).subscribe(ms => {
      this.messages.set(ms);
      this.scrollToBottom();
    });
    // Mark as read on open and refresh unread badge
    this.chat.markConversationAsRead(myId, c.userId).subscribe(() => {
      this.chat.getUnreadMessageCount().subscribe(count => this.unread.set(count as unknown as number));
    });
  }

  send(): void {
    if (!this.draft.trim() || !this.selected()) return;
    this.chat.sendMessage(this.selected()!.userId, this.draft.trim()).subscribe(m => {
      this.messages.update(prev => [...prev, m]);
      this.draft = '';
      this.scrollToBottom();
    });
  }

  onTyping(): void {
    if (!this.selected()) return;
    this.chat.sendTypingIndicator(this.selected()!.userId, true);
    if (this.typingTimer) clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => this.chat.sendTypingIndicator(this.selected()!.userId, false), 900);
  }

  isOwn(m: ChatMessage): boolean { return m.senderId === this.currentUser()?.id; }

  isOnline(email: string | undefined): boolean {
    if (!email) return false;
    return this.onlineEmails().has(email);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = document.querySelector('.messages');
      if (el) (el as HTMLElement).scrollTop = (el as HTMLElement).scrollHeight;
    }, 50);
  }
}


