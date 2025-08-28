import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';


import { UserService } from '../../../core/user/user.service';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.interface';
import { EditUserDialogComponent } from '../edit-user-dialog/edit-user-dialog.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string>('');
  readonly users = signal<User[]>([]);
  readonly showCreateForm = signal(false);
  readonly selectedFile = signal<File | null>(null);

  readonly displayedColumns = ['avatar', 'username', 'email', 'fullName', 'role', 'actions'];
  readonly userRoles = ['ADMIN', 'SUPERVISOR', 'USER'];

  createUserForm: FormGroup;

  constructor() {
    this.createUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set('');

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load users');
        this.loading.set(false);
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      console.log('🖼️ Image error, setting fallback to SVG');
      target.src = '/assets/default-avatar.svg';
    }
  }

  onImageLoad(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      console.log('✅ Image loaded successfully:', target.src);
    }
  }

  createUser(): void {
    if (this.createUserForm.valid) {
      this.loading.set(true);
      
      const formData = new FormData();
      formData.append('user', JSON.stringify(this.createUserForm.value));
      
      if (this.selectedFile()) {
        formData.append('avatar', this.selectedFile()!);
      }

      this.userService.createUser(formData).subscribe({
        next: (user) => {
          this.users.update(users => [...users, user]);
          this.createUserForm.reset();
          this.showCreateForm.set(false);
          this.selectedFile.set(null);
          this.loading.set(false);
          this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to create user');
          this.loading.set(false);
          this.snackBar.open('Error creating user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  updateUserPhoto(userId: number, event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.loading.set(true);
      
      const formData = new FormData();
      formData.append('avatar', file);

      this.userService.updateUserPhoto(userId, formData).subscribe({
        next: (user) => {
          this.users.update(users => 
            users.map(u => u.id === userId ? user : u)
          );
          this.loading.set(false);
          this.snackBar.open('User photo updated successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.loading.set(false);
          this.snackBar.open('Error updating user photo', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.loading.set(true);
      
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.users.update(users => users.filter(u => u.id !== userId));
          this.loading.set(false);
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.loading.set(false);
          this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  viewUser(userId: number): void {
    const user = this.users().find(u => u.id === userId);
    if (user) {
      this.snackBar.open(`Viewing user: ${user.fullName} (${user.email})`, 'Close', { duration: 3000 });
    }
    
    // TODO: Implement user details dialog
    // this.dialog.open(UserDetailsDialogComponent, {
    //   data: { user }
    // });
  }

  editUser(userId: number): void {
    const user = this.users().find(u => u.id === userId);
    if (user) {
      // Open edit dialog
      const dialogRef = this.dialog.open(EditUserDialogComponent, {
        width: '500px',
        data: { user: { ...user } }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loading.set(true);
          this.userService.updateUser(userId, result).subscribe({
            next: (updatedUser) => {
              this.users.update(users => 
                users.map(u => u.id === userId ? updatedUser : u)
              );
              this.loading.set(false);
              this.snackBar.open('User updated successfully!', 'Close', { duration: 3000 });
            },
            error: (err) => {
              this.loading.set(false);
              this.snackBar.open('Error updating user', 'Close', { duration: 3000 });
            }
          });
        }
      });
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return 'warn';
      case 'SUPERVISOR': return 'accent';
      case 'USER': return 'primary';
      default: return 'primary';
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
