import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private router = inject(Router);
  
  private sessionCheckInterval: Subscription | null = null;
  private readonly SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

  constructor() {
    this.startSessionMonitoring();
  }

  startSessionMonitoring(): void {
    if (this.isUserAuthenticated()) {
      this.sessionCheckInterval = interval(this.CHECK_INTERVAL).subscribe(() => {
        this.checkSessionExpiration();
      });
    }
  }

  stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      this.sessionCheckInterval.unsubscribe();
      this.sessionCheckInterval = null;
    }
  }

  private checkSessionExpiration(): void {
    const lastActivity = this.getLastActivity();
    const currentTime = Date.now();
    
    if (lastActivity && (currentTime - lastActivity) > this.SESSION_TIMEOUT) {
      this.handleSessionExpiration();
    }
  }

  updateLastActivity(): void {
    localStorage.setItem('lastActivity', Date.now().toString());
  }

  private getLastActivity(): number | null {
    const lastActivity = localStorage.getItem('lastActivity');
    return lastActivity ? parseInt(lastActivity, 10) : null;
  }

  private handleSessionExpiration(): void {
    console.log('Session expired due to inactivity');
    
    // Clear authentication data from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('lastActivity');
    
    // Stop session monitoring
    this.stopSessionMonitoring();
    
    // Redirect to login page
    this.router.navigate(['/login']);
    
    // Show session expired message
    alert('Your session has expired due to inactivity. Please login again.');
  }

  resetSessionTimer(): void {
    this.updateLastActivity();
  }

  initializeSession(): void {
    this.updateLastActivity();
    this.startSessionMonitoring();
  }

  cleanupSession(): void {
    this.stopSessionMonitoring();
    localStorage.removeItem('lastActivity');
  }

  private isUserAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }
} 