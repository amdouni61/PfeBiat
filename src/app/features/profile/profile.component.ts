import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../core/models/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>person</mat-icon>
            User Profile
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="profile-info" *ngIf="currentUser()">
            <p><strong>Username:</strong> {{ currentUser()?.username }}</p>
            <p><strong>Email:</strong> {{ currentUser()?.email }}</p>
            <p><strong>Full Name:</strong> {{ currentUser()?.fullName }}</p>
            <p><strong>Role:</strong> {{ currentUser()?.role }}</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    .profile-card {
      margin-top: 20px;
    }
    .profile-info p {
      margin: 10px 0;
      font-size: 16px;
    }
  `]
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  readonly currentUser = computed(() => this.authService.getCurrentUser());
}
