import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../../core/task/task.service';
import { TaskType, TaskPriority } from '../../../core/models/task.interface';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal<string>('');
  readonly isEditMode = signal(false);

  readonly taskTypes = Object.values(TaskType);
  readonly taskPriorities = Object.values(TaskPriority);

  readonly taskForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    type: [TaskType.OTHER, [Validators.required]],
    priority: [TaskPriority.MEDIUM, [Validators.required]],
    date: ['', [Validators.required]],
    startTime: [''],
    endTime: [''],
    deadline: [''],
    attachmentUrl: ['']
  });

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      this.isEditMode.set(true);
      this.loadTask(Number(taskId));
    }
  }

  loadTask(taskId: number): void {
    this.loading.set(true);
    this.taskService.getTaskById(taskId).subscribe({
      next: (task) => {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          type: task.type,
          priority: task.priority,
          date: task.date,
          startTime: task.startTime,
          endTime: task.endTime,
          deadline: task.deadline,
          attachmentUrl: task.attachmentUrl
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load task');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.loading.set(true);
      this.error.set('');

      const taskData = this.taskForm.value;
      
      if (this.isEditMode()) {
        const taskId = Number(this.route.snapshot.paramMap.get('id'));
        this.taskService.updateTask(taskId, taskData).subscribe({
          next: () => {
            this.loading.set(false);
            this.router.navigate(['/tasks']);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Failed to update task');
            this.loading.set(false);
          }
        });
      } else {
        this.taskService.createTask(taskData).subscribe({
          next: () => {
            this.loading.set(false);
            this.router.navigate(['/tasks']);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Failed to create task');
            this.loading.set(false);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }
}
