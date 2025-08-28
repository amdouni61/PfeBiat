import { Component, inject, computed, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly isAuthenticated = computed(() => this.authService.isUserAuthenticated());
  readonly currentUser = computed(() => this.authService.getCurrentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  readonly isSupervisor = computed(() => this.currentUser()?.role === 'SUPERVISOR');

  // Sidebar state
  readonly sidebarOpen = signal(true);
  readonly sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
