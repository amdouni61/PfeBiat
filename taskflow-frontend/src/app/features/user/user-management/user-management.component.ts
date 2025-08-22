import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  error = '';
  loading = false;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load users';
        this.loading = false;
      }
    });
  }

  createUser() {
    this.router.navigate(['/users/new']);
  }

  editUser(id: number) {
    this.router.navigate(['/users', id, 'edit']);
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => this.error = err.error?.message || 'Failed to delete user'
      });
    }
  }
} 