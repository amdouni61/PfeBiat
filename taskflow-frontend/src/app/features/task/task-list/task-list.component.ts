import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { TaskService } from '../../../core/task/task.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Task, TaskStatus } from '../../../core/models/task.interface';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string>('');
  readonly tasks = signal<Task[]>([]);
  readonly selectedStatus = signal<string>('ALL');

  readonly displayedColumns = ['title', 'type', 'priority', 'status', 'date', 'user', 'actions'];
  readonly statusOptions = ['ALL', ...Object.values(TaskStatus)];

  readonly filteredTasks = computed(() => {
    const tasks = this.tasks();
    const status = this.selectedStatus();
    
    if (status === 'ALL') {
      return tasks;
    }
    
    return tasks.filter(task => task.status === status);
  });

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);
    this.error.set('');

    this.taskService.getMyTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load tasks');
        this.loading.set(false);
      }
    });
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
  }

  viewTask(taskId: number): void {
    this.router.navigate(['/tasks', taskId]);
  }

  editTask(taskId: number): void {
    this.router.navigate(['/tasks', taskId, 'edit']);
  }

  deleteTask(taskId: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to delete task');
        }
      });
    }
  }

  createNewTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'success';
      case TaskStatus.APPROVED:
        return 'primary';
      case TaskStatus.PENDING:
        return 'accent';
      case TaskStatus.REJECTED:
        return 'warn';
      default:
        return 'primary';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'HIGH':
        return 'warn';
      case 'MEDIUM':
        return 'accent';
      case 'LOW':
        return 'primary';
      default:
        return 'primary';
    }
  }
}
