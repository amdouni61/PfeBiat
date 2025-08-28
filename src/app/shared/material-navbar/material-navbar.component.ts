import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AsyncPipe, NgIf, CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-material-navbar',
  templateUrl: './material-navbar.component.html',
  styleUrls: ['./material-navbar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    AsyncPipe,
    NgIf
  ]
})
export class MaterialNavbarComponent implements OnInit, OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private router = inject(Router);
  private navigationSubscription!: Subscription;

  isHandset$: Observable<boolean>;
  sidebarOpened = true; // Persistent sidebar state

  constructor() {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
    
    // Always start with sidebar open on desktop
    this.sidebarOpened = true;
    
    // Restore sidebar state from localStorage
    const savedState = localStorage.getItem('sidebarOpened');
    if (savedState !== null) {
      this.sidebarOpened = JSON.parse(savedState);
    }
  }

  ngOnInit(): void {
    // Subscribe to navigation events to close sidebar on mobile
    this.navigationSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.closeSidebarOnMobile();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  toggleSidebar(): void {
    this.sidebarOpened = !this.sidebarOpened;
    // Save sidebar state to localStorage
    localStorage.setItem('sidebarOpened', JSON.stringify(this.sidebarOpened));
  }

  // Close sidebar on mobile when navigating
  closeSidebarOnMobile(): void {
    this.isHandset$.pipe(
      map(isHandset => {
        if (isHandset && this.sidebarOpened) {
          this.sidebarOpened = false;
          localStorage.setItem('sidebarOpened', JSON.stringify(false));
        }
      })
    ).subscribe();
  }

  // Force sidebar to stay open on desktop
  getSidebarOpened(): boolean {
    return this.sidebarOpened;
  }

  isAuthenticated(): boolean {
    return this.authService.isUserAuthenticated();
  }

  isSupervisorOrAdmin(): boolean {
    return this.authService.isSupervisor() || this.authService.isAdmin();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
  }
}
