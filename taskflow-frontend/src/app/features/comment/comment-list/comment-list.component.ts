import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { CommentService } from '../../../core/comment/comment.service';
import { Comment } from '../../../core/models/comment.interface';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentListComponent implements OnInit {
  private router = inject(Router);
  private commentService = inject(CommentService);

  readonly loading = signal(false);
  readonly error = signal<string>('');
  readonly comments = signal<Comment[]>([]);

  readonly displayedColumns = ['content', 'user', 'task', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.loading.set(true);
    this.error.set('');

    this.commentService.getAllComments().subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load comments');
        this.loading.set(false);
      }
    });
  }

  viewComment(commentId: number): void {
    this.router.navigate(['/comments', commentId]);
  }

  editComment(commentId: number): void {
    this.router.navigate(['/comments', commentId, 'edit']);
  }

  deleteComment(commentId: number): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          this.comments.update(comments => comments.filter(c => c.id !== commentId));
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to delete comment');
        }
      });
    }
  }

  createNewComment(): void {
    this.router.navigate(['/comments/new']);
  }
}
