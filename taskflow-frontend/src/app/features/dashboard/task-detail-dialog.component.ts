import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { Task } from '../../core/models/task.interface';
import { Comment } from '../../core/models/comment.interface';
import { CommentService } from '../../core/comment/comment.service';
import { AuthService } from '../../core/auth/auth.service';

export interface TaskDetailDialogData {
  task: Task;
}

@Component({
  selector: 'app-task-detail-dialog',
  templateUrl: './task-detail-dialog.component.html',
  styleUrls: ['./task-detail-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetailDialogComponent implements OnInit {
  private commentService = inject(CommentService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<TaskDetailDialogComponent>);
  private data = inject(MAT_DIALOG_DATA);

  readonly task = signal<Task>(this.data.task);
  readonly comments = signal<Comment[]>([]);
  readonly loading = signal(false);
  readonly addingComment = signal(false);
  readonly currentUser = computed(() => this.authService.getCurrentUser());

  commentForm: FormGroup;

  constructor() {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.loading.set(true);
    this.commentService.getCommentsByTask(this.task().id).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.loading.set(false);
      }
    });
  }

  addComment(): void {
    if (this.commentForm.valid) {
      this.addingComment.set(true);
      const commentData = {
        content: this.commentForm.value.content,
        taskId: this.task().id
      };

      console.log('🔄 Adding comment:', commentData);
      console.log('🔄 Current task:', this.task());
      console.log('🔄 Form valid:', this.commentForm.valid);
      console.log('🔄 Form errors:', this.commentForm.errors);

      this.commentService.createComment(commentData).subscribe({
        next: (newComment) => {
          console.log('✅ Comment created successfully:', newComment);
          this.comments.update(comments => [newComment, ...comments]);
          this.commentForm.reset();
          this.addingComment.set(false);
          this.snackBar.open('Comment posted successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('❌ Error creating comment:', err);
          console.error('❌ Error status:', err.status);
          console.error('❌ Error message:', err.message);
          console.error('❌ Error response:', err.error);
          this.addingComment.set(false);
          
          let errorMessage = 'Error posting comment';
          if (err.status === 403) {
            errorMessage = 'Access denied. You may not have permission to comment on this task.';
          } else if (err.status === 404) {
            errorMessage = 'Task not found. Please refresh the page and try again.';
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    } else {
      console.log('❌ Form invalid:', this.commentForm.errors);
      console.log('❌ Form value:', this.commentForm.value);
      console.log('❌ Form status:', this.commentForm.status);
      
      // Show validation errors
      Object.keys(this.commentForm.controls).forEach(key => {
        const control = this.commentForm.get(key);
        if (control?.invalid) {
          console.log(`❌ Control ${key} errors:`, control.errors);
        }
      });
      
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return 'priority-medium';
    }
  }

  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'COMPLETED': return 'status-completed';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  close(): void {
    this.dialogRef.close();
  }
} 