import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing.module';
import { JwtInterceptor } from './app/core/auth/jwt.interceptor';

// Only clear auth data if this is a fresh app start (not a browser refresh)
function shouldClearAuthData(): boolean {
  // Check if this is a fresh app start by looking for a specific flag
  const isFreshStart = sessionStorage.getItem('app_fresh_start');
  
  if (!isFreshStart) {
    // This is a fresh app start
    sessionStorage.setItem('app_fresh_start', 'true');
    return true;
  }
  
  // This is a browser refresh, don't clear auth data
  return false;
}

// Clear auth data only on fresh app start
if (shouldClearAuthData()) {
  console.log('🚀 TaskFlow App Starting - Clearing stored auth data');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('current_user');
  console.log('🧹 Stored auth data cleared');
} else {
  console.log('🔄 Browser refresh detected - keeping auth data');
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([JwtInterceptor])),
    provideAnimations()
  ]
}).catch(err => console.error(err));
