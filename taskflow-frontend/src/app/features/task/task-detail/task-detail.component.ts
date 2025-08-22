import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { TaskService } from '../../../core/task/task.service';
import { Task } from '../../../core/models/task.interface';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);

  readonly task = signal<Task | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string>('');

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        this.task.set(task);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load task');
        this.loading.set(false);
      }
    });
  }

  editTask() {
    const task = this.task();
    if (task) {
      this.router.navigate(['/tasks', task.id, 'edit']);
    }
  }

  deleteTask() {
    const task = this.task();
    if (task && confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err) => this.error.set(err.error?.message || 'Failed to delete task')
      });
    }
  }
}
