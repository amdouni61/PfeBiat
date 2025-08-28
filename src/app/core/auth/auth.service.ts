import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.interface';
import { LoginCredentials, LoginResponse } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = 'http://localhost:8080';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  // Signals for reactive state management
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _currentUser = signal<User | null>(null);
  private readonly _token = signal<string | null>(null);

  // Computed signals
  readonly isUserAuthenticated = computed(() => this._isAuthenticated());
  readonly getCurrentUser = computed(() => this._currentUser());
  readonly getToken = computed(() => this._token());

  // Computed signals for role-based access
  readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');
  readonly isSupervisor = computed(() => this._currentUser()?.role === 'SUPERVISOR');

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    // Restore stored auth data if available
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        this._token.set(token);
        this._currentUser.set(parsedUser);
        this._isAuthenticated.set(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuthData();
      }
    }
  }

  // Method to clear auth data on app restart
  clearAuthOnRestart(): void {
    console.log('🔄 Clearing auth data on app restart');
    this.clearAuthData();
  }

  // Method to check if token is expired
  isTokenExpired(): boolean {
    const token = this._token();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      return currentTime >= expirationTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response);
        })
      );
  }

  register(registerData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/register`, registerData);
  }

  logout(): void {
    // Clear authentication data
    this.clearAuthData();
    
    // Redirect to login
    this.router.navigate(['/login']);
  }

  setAuthData(response: LoginResponse): void {
    const user = response.user || this.extractUserFromToken(response.token);
    
    if (user) {
      this._currentUser.set(user);
      this._token.set(response.token);
      this._isAuthenticated.set(true);
      
      // Store in localStorage
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private clearAuthData(): void {
    this._currentUser.set(null);
    this._token.set(null);
    this._isAuthenticated.set(false);
    
    // Clear localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private extractUserFromToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: 0, // Will be set by backend
        email: payload.email,
        fullName: payload.sub,
        username: payload.email,
        role: payload.roles?.replace('ROLE_', '') as any,
        enabled: true,
        isHidden: false
      };
    } catch (error) {
      console.error('Error extracting user from token:', error);
      return null;
    }
  }

  // Method to update user activity (called on user interactions)
  updateUserActivity(): void {
  }
}
