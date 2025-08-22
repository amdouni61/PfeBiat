import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.interface';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly user = signal<User | null>(this.authService.getCurrentUser());
  readonly loading = signal(false);
  readonly error = signal<string>('');

  editProfile(): void {
    this.router.navigate(['/settings']);
  }
}
