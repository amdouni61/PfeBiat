import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.interface';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSettingsComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly user = signal<User | null>(this.authService.getCurrentUser());
  readonly loading = signal(false);
  readonly error = signal<string>('');

  readonly settingsForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor() {
    const currentUser = this.user();
    if (currentUser) {
      this.settingsForm.patchValue({
        fullName: currentUser.fullName,
        username: currentUser.username,
        email: currentUser.email
      });
    }
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      this.loading.set(true);
      this.error.set('');
      
      // Here you would typically call a service to update user settings
      console.log('Saving settings:', this.settingsForm.value);
      
      // Simulate API call
      setTimeout(() => {
        this.loading.set(false);
        this.router.navigate(['/profile']);
      }, 1000);
    }
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
