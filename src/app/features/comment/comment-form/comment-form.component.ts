import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommentService } from 'src/app/core/comment/comment.service';

@Component({
  selector: 'app-comment-form',
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private commentService = inject(CommentService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly isEdit = signal(false);

  commentForm: FormGroup;

  constructor() {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]],
      taskId: [null, [Validators.required]]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const taskId = this.route.snapshot.queryParamMap.get('taskId');
    
    if (id) {
      this.isEdit.set(true);
      this.commentService.getCommentById(Number(id)).subscribe({
        next: (comment) => {
          this.commentForm.patchValue({
            content: comment.content,
            taskId: comment.taskId
          });
        },
        error: (err) => this.error.set(err.error?.message || 'Failed to load comment')
      });
    } else if (taskId) {
      this.commentForm.patchValue({ taskId: Number(taskId) });
    }
  }

  saveComment() {
    if (this.commentForm.valid) {
      this.loading.set(true);
      this.error.set('');

      const commentData = this.commentForm.value;
      
      if (this.isEdit()) {
        const id = this.route.snapshot.paramMap.get('id');
        this.commentService.updateComment(Number(id), commentData).subscribe({
          next: () => {
            this.snackBar.open('Comment updated successfully', 'Close', { duration: 3000 });
            // Go back to previous page instead of redirecting
            this.router.navigate(['../']);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Failed to update comment');
            this.loading.set(false);
            this.snackBar.open('Error updating comment', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.commentService.createComment(commentData).subscribe({
          next: () => {
            this.snackBar.open('Comment created successfully', 'Close', { duration: 3000 });
            // Go back to previous page instead of redirecting
            this.router.navigate(['../']);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Failed to create comment');
            this.loading.set(false);
            this.snackBar.open('Error creating comment', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }
}
