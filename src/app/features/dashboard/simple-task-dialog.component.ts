import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { TaskService } from 'src/app/core/task/task.service';

@Component({
  selector: 'app-simple-task-dialog',
  template: `
    <h2 mat-dialog-title>Create New Task</h2>
    <mat-dialog-content>
      <form #taskForm="ngForm">
        <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 16px;">
          <mat-label>Title</mat-label>
          <input matInput [(ngModel)]="task.title" name="title" required>
        </mat-form-field>
        
        <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 16px;">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="task.description" name="description" rows="3"></textarea>
        </mat-form-field>
        
        <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 16px;">
          <mat-label>Type</mat-label>
          <mat-select [(ngModel)]="task.type" name="type" required>
            <mat-option value="DEVELOPMENT">DEVELOPMENT</mat-option>
            <mat-option value="TESTING">TESTING</mat-option>
            <mat-option value="MEETING">MEETING</mat-option>
            <mat-option value="PLANNING">PLANNING</mat-option>
            <mat-option value="SUPPORT">SUPPORT</mat-option>
            <mat-option value="DOCUMENTATION">DOCUMENTATION</mat-option>
            <mat-option value="OTHER">OTHER</mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 16px;">
          <mat-label>Priority</mat-label>
          <mat-select [(ngModel)]="task.priority" name="priority" required>
            <mat-option value="LOW">LOW</mat-option>
            <mat-option value="MEDIUM">MEDIUM</mat-option>
            <mat-option value="HIGH">HIGH</mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field appearance="fill" style="width: 100%; margin-bottom: 16px;">
          <mat-label>Date</mat-label>
          <input matInput [(ngModel)]="task.date" name="date" type="date" required>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!taskForm.valid">Create Task</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDialogModule]
})
export class SimpleTaskDialogComponent {
  task: any = {
    title: '',
    description: '',
    type: 'DEVELOPMENT',
    priority: 'MEDIUM',
    date: '',
    status: 'PENDING'
  };

  constructor(
    public dialogRef: MatDialogRef<SimpleTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private taskService: TaskService
  ) {
    if (data && data.date) {
      this.task.date = data.date;
    }
  }

  onSubmit() {
    if (this.task.title && this.task.type && this.task.date) {
      this.taskService.createTask(this.task).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error creating task:', err);
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 