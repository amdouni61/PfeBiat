import { Component, OnInit, inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../core/user/user.service';
import { WebSocketService, OnlineUser } from '../../../core/services/websocket.service';
import { User } from '../../../core/models/user.interface';
import { AuthService } from '../../../core/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent implements OnInit, OnDestroy {
  userService = inject(UserService);
  private webSocketService = inject(WebSocketService);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  users!: User[];
  onlineUsers: OnlineUser[] = [];
  displayedColumns: string[] = ['fullName', 'email', 'role', 'status', 'hiddenStatus', 'onlineStatus', 'actions'];
  
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    // Debug current user authentication status
    console.log('🔐 Current user authenticated:', this.authService.isUserAuthenticated());
    console.log('🔐 Current user:', this.authService.getCurrentUser());
    console.log('🔐 Current user role:', this.authService.getCurrentUser()?.role);
    console.log('🔐 Is admin:', this.authService.isAdmin());
    console.log('🔐 Is supervisor:', this.authService.isSupervisor());
    
    this.loadUsers();
    //this.subscribeToOnlineStatus();
  }

  ngOnDestroy(): void {
    //this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadUsers(): void {
    console.log("🔄 Starting to load users...");
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('✅ Users loaded successfully:', users);
        console.log('✅ Users array length:', users?.length);
        console.log('✅ Users type:', typeof users);
        console.log('✅ Is users array?', Array.isArray(users));
        if (users && users.length > 0) {
          console.log('✅ First user sample:', users[0]);
        }
        this.users = [...users];
        console.log('✅ Component users property set to:', this.users);
        // Request online users list from WebSocket
        //this.webSocketService.requestOnlineUsers();
      },
      error: (error) => {
        console.error('❌ Error loading users:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error response:', error.error);
        console.error('❌ Error headers:', error.headers);
        console.error('❌ Full error object:', JSON.stringify(error, null, 2));
        
        let errorMessage = 'Error loading users';
        if (error.status === 403) {
          errorMessage = 'Access denied. You may not have permission to view users.';
        } else if (error.status === 401) {
          errorMessage = 'Authentication required. Please login again.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  private subscribeToOnlineStatus(): void {
    // Subscribe to online users updates
    const onlineUsersSub = this.webSocketService.onlineUsers$.subscribe(users => {
      this.onlineUsers = users;
    });

    // Subscribe to real-time status updates
    const statusUpdatesSub = this.webSocketService.userStatusUpdates$.subscribe(update => {
      if (update) {
        // Show notification for admin
        this.showUserStatusNotification(update);
      }
    });

    this.subscriptions.push(onlineUsersSub, statusUpdatesSub);
  }

  private showUserStatusNotification(update: any): void {
    const status = update.status === 'ONLINE' ? 'connected' : 'disconnected';
    const message = `User ${update.userEmail} has ${status}`;
    
    this.snackBar.open(message, 'Close', { 
      duration: 3000,
      panelClass: update.status === 'ONLINE' ? 'success-snackbar' : 'info-snackbar'
    });
  }

  isUserOnline(userEmail: string): boolean {
    return this.onlineUsers.some(onlineUser => 
      onlineUser.email === userEmail && onlineUser.status === 'ONLINE'
    );
  }

  getUserOnlineStatus(userEmail: string): string {
    const onlineUser = this.onlineUsers.find(user => user.email === userEmail);
    if (onlineUser) {
      return onlineUser.status;
    }
    return 'OFFLINE';
  }

  getOnlineStatusColor(status: string): string {
    switch (status) {
      case 'ONLINE': return 'success';
      case 'OFFLINE': return 'warn';
      default: return 'basic';
    }
  }

  hideUser(user: User): void {
    this.userService.hideUser(user.id).subscribe({
      next: () => {
        this.snackBar.open(`User ${user.fullName} has been hidden`, 'Close', { duration: 3000 });
        this.loadUsers(); // Reload to update the list
      },
      error: (error) => {
        console.error('Error hiding user:', error);
        this.snackBar.open('Error hiding user', 'Close', { duration: 3000 });
      }
    });
  }

  unhideUser(user: User): void {
    this.userService.unhideUser(user.id).subscribe({
      next: () => {
        this.snackBar.open(`User ${user.fullName} has been unhidden`, 'Close', { duration: 3000 });
        this.loadUsers(); // Reload to update the list
      },
      error: (error) => {
        console.error('Error unhiding user:', error);
        this.snackBar.open('Error unhiding user', 'Close', { duration: 3000 });
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open(`User ${user.fullName} has been deleted`, 'Close', { duration: 3000 });
          this.loadUsers(); // Reload to update the list
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return 'warn';
      case 'SUPERVISOR': return 'primary';
      case 'USER': return 'accent';
      default: return 'basic';
    }
  }

  getStatusColor(enabled: boolean): string {
    return enabled ? 'primary' : 'warn';
  }

  getHiddenStatusColor(isHidden: boolean): string {
    return isHidden ? 'warn' : 'primary';
  }

  // Add missing method for checking if user is hidden
  isUserHidden(user: User): boolean {
    return user.isHidden || false;
  }
} 