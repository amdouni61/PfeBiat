import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-material-navbar',
  templateUrl: './material-navbar.component.html',
  styleUrls: ['./material-navbar.component.scss']
})
export class MaterialNavbarComponent {
  isHandset$: Observable<boolean>;

  constructor(private breakpointObserver: BreakpointObserver, private authService: AuthService) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
  }
}
