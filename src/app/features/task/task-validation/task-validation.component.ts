import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';


import { TaskService } from '../../../core/task/task.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Task, TaskStatus } from '../../../core/models/task.interface';

@Component({
  selector: 'app-task-validation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatDividerModule,
    MatListModule
  ],
  template: `
    <div class="page-container">
      <div class="content-wrapper">
        <div class="validation-header">
          <div class="header-content">
            <div class="header-left">
              <h1 class="page-title">Task Validation</h1>
              <p class="page-subtitle">Review and validate submitted tasks from your team members</p>
            </div>
            <div class="header-right">
              <div class="stats-summary">
                <div class="stat-item">
                  <span class="stat-number">{{ pendingTasksCount() }}</span>
                  <span class="stat-label">Pending</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ approvedTasksCount() }}</span>
                  <span class="stat-label">Approved</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ rejectedTasksCount() }}</span>
                  <span class="stat-label">Rejected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="loading-container" *ngIf="loading()">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading tasks for validation...</p>
        </div>

        <div class="error-container" *ngIf="error()">
          <mat-icon>error</mat-icon>
          <p>{{ error() }}</p>
          <button mat-raised-button color="primary" (click)="loadPendingTasks()">
            <mat-icon>refresh</mat-icon>
            Try Again
          </button>
        </div>

        <div class="validation-content" *ngIf="!loading() && !error()">
          <div class="filter-tabs">
            <button 
              mat-button 
              [class.active]="activeFilter() === 'pending'"
              (click)="setFilter('pending')"
              class="filter-btn">
              Pending
              <span class="count-badge" *ngIf="pendingTasksCount() > 0">{{ pendingTasksCount() }}</span>
            </button>
            <button 
              mat-button 
              [class.active]="activeFilter() === 'approved'"
              (click)="setFilter('approved')"
              class="filter-tab">
              <mat-icon>check_circle</mat-icon>
              Approved
            </button>
            <button 
              mat-button 
              [class.active]="activeFilter() === 'rejected'"
              (click)="setFilter('rejected')"
              class="filter-tab">
              <mat-icon>cancel</mat-icon>
              Rejected
            </button>
          </div>

          <div class="tasks-container">
            <div class="empty-state" *ngIf="getFilteredTasks().length === 0">
              <mat-icon>assignment</mat-icon>
              <h3>No tasks found</h3>
              <p *ngIf="activeFilter() === 'pending'">All submitted tasks have been reviewed!</p>
              <p *ngIf="activeFilter() === 'approved'">No approved tasks yet.</p>
              <p *ngIf="activeFilter() === 'rejected'">No rejected tasks yet.</p>
            </div>

            <div class="task-list" *ngIf="getFilteredTasks().length > 0">
              <mat-card class="task-card" *ngFor="let task of getFilteredTasks()">
                <mat-card-header>
                  <div class="task-header-content">
                    <div class="task-title-section">
                      <h3 class="task-title">{{ task.title }}</h3>
                      <div class="task-meta">
                        <span class="type-badge type-{{ task.type.toLowerCase() }}">
                          {{ task.type }}
                        </span>
                        <span class="priority-badge priority-{{ task.priority.toLowerCase() }}">
                          {{ task.priority }}
                        </span>
                        <span class="date-info">
                          <mat-icon>event</mat-icon>
                          {{ task.date | date:'MMM d, y' }}
                        </span>
                      </div>
                    </div>
                    <div class="task-status">
                      <span class="status-badge status-{{ task.status.toLowerCase() }}">
                        {{ task.status }}
                      </span>
                    </div>
                  </div>
                </mat-card-header>

                <mat-card-content>
                  <div class="task-description">
                    <p>{{ task.description }}</p>
                  </div>

                  <div class="task-details">
                    <div class="detail-item">
                      <mat-icon>person</mat-icon>
                      <span><strong>Created by:</strong> {{ task.userFullName }}</span>
                    </div>
                    <div class="detail-item" *ngIf="task.supervisorFullName">
                      <mat-icon>supervisor_account</mat-icon>
                      <span><strong>Supervisor:</strong> {{ task.supervisorFullName }}</span>
                    </div>
                    <div class="detail-item">
                      <mat-icon>schedule</mat-icon>
                      <span><strong>Submitted:</strong> {{ task.submittedAt | date:'MMM d, h:mm a' }}</span>
                    </div>
                  </div>

                  <div class="rejection-reason" *ngIf="task.status === 'REJECTED' && task.rejectionReason">
                    <mat-expansion-panel>
                      <mat-expansion-panel-header>
                        <mat-panel-title>
                          <mat-icon color="warn">info</mat-icon>
                          Rejection Reason
                        </mat-panel-title>
                      </mat-expansion-panel-header>
                      <p>{{ task.rejectionReason }}</p>
                    </mat-expansion-panel>
                  </div>
                </mat-card-content>

                <mat-card-actions class="task-actions" *ngIf="task.status === 'SUBMITTED'">
                  <button 
                    mat-raised-button 
                    color="primary" 
                    (click)="approveTask(task)"
                    class="action-btn approve-btn">
                    <mat-icon>check</mat-icon>
                    Approve
                  </button>
                  <button 
                    mat-raised-button 
                    color="warn" 
                    (click)="rejectTask(task)"
                    class="action-btn reject-btn">
                    <mat-icon>close</mat-icon>
                    Reject
                  </button>
                  <button 
                    mat-button 
                    (click)="viewTaskDetails(task)"
                    class="action-btn view-btn">
                    <mat-icon>visibility</mat-icon>
                    View Details
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./task-validation.component.scss']
})
export class TaskValidationComponent implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly error = signal<string>('');
  readonly pendingTasks = signal<Task[]>([]);
  readonly approvedTasks = signal<Task[]>([]);
  readonly rejectedTasks = signal<Task[]>([]);
  readonly activeFilter = signal<'pending' | 'approved' | 'rejected'>('pending');

  readonly pendingTasksCount = computed(() => this.pendingTasks()?.length || 0);
  readonly approvedTasksCount = computed(() => this.approvedTasks()?.length || 0);
  readonly rejectedTasksCount = computed(() => this.rejectedTasks()?.length || 0);

  ngOnInit(): void {
    this.loadPendingTasks();
  }

  loadPendingTasks(): void {
    this.loading.set(true);
    this.error.set('');

    this.taskService.getTasksPendingValidation().subscribe({
      next: (tasks) => {
        this.pendingTasks.set(tasks);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load pending tasks. Please try again.');
        this.loading.set(false);
        console.error('Error loading pending tasks:', err);
      }
    });
  }

  setFilter(filter: 'pending' | 'approved' | 'rejected'): void {
    this.activeFilter.set(filter);
  }

  getFilteredTasks(): Task[] {
    switch (this.activeFilter()) {
      case 'pending':
        return this.pendingTasks() || [];
      case 'approved':
        return this.approvedTasks() || [];
      case 'rejected':
        return this.rejectedTasks() || [];
      default:
        return [];
    }
  }

  approveTask(task: Task): void {
    this.taskService.validateTask(task.id, true, 'Task approved').subscribe({
      next: (updatedTask) => {
        this.pendingTasks.update(tasks => tasks.filter(t => t.id !== task.id));
        this.approvedTasks.update(tasks => [updatedTask, ...tasks]);
        
        this.snackBar.open('Task approved successfully!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open('Failed to approve task. Please try again.', 'Close', { duration: 3000 });
        console.error('Error approving task:', err);
      }
    });
  }

  rejectTask(task: Task): void {
    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (rejectionReason && rejectionReason.trim()) {
      this.taskService.validateTask(task.id, false, '', rejectionReason.trim()).subscribe({
        next: (updatedTask) => {
          this.pendingTasks.update(tasks => tasks.filter(t => t.id !== task.id));
          this.rejectedTasks.update(tasks => [updatedTask, ...tasks]);
          
          this.snackBar.open('Task rejected successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open('Failed to reject task. Please try again.', 'Close', { duration: 3000 });
          console.error('Error rejecting task:', err);
        }
      });
    }
  }

  viewTaskDetails(task: Task): void {
    console.log('View task details:', task);
  }
}
