import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { RegisterData, User } from '../../../core/models/user.interface';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string>('');

  readonly registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  register(): void {
    if (this.registerForm.valid) {
      this.loading.set(true);
      this.error.set('');
      const registerData: RegisterData = {
        fullName: this.registerForm.get('fullName')?.value,
        username: this.registerForm.get('username')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value
      };
      this.authService.register(registerData).subscribe({
        next: (user: User) => {
          // After successful registration, automatically log in
          this.authService.login({
            email: registerData.email,
            password: registerData.password
          }).subscribe({
            next: (loginResponse) => {
              this.authService.setAuthData(loginResponse);
              this.router.navigate(['/dashboard']);
            },
            error: (err) => {
              this.error.set(err.error?.message || 'Login failed after registration');
              this.loading.set(false);
            }
          });
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Registration failed');
          this.loading.set(false);
        }
      });
    }
  }
}
