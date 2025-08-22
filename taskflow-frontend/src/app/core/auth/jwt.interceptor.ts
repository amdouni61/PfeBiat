import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const JwtInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');
  
  console.log('🔐 JWT Interceptor - Request URL:', request.url);
  console.log('🔐 JWT Interceptor - Token found:', !!token);
  console.log('🔐 JWT Interceptor - Token value:', token ? token.substring(0, 20) + '...' : 'null');
  
  if (token) {
    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('🔐 JWT Interceptor - Token expired, clearing auth data');
      clearAuthData();
      router.navigate(['/login']);
      return throwError(() => new Error('Token expired'));
    }
    
    console.log('🔐 JWT Interceptor - Adding Authorization header');
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.log('🔐 JWT Interceptor - No token found, request will be sent without Authorization');
  }
  
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.log('🔐 JWT Interceptor - 401 Unauthorized, clearing auth data and redirecting to login');
        clearAuthData();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

// Helper function to check if token is expired
function isTokenExpired(token: string): boolean {
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

// Helper function to clear auth data
function clearAuthData(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('current_user');
} 