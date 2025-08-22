import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgChartsModule } from 'ng2-charts';
import dayGridPlugin from '@fullcalendar/daygrid';
import { ChartData, ChartOptions } from 'chart.js';
import { TaskService } from '../../core/task/task.service';
import { CommentService } from '../../core/comment/comment.service';
import { AuthService } from '../../core/auth/auth.service';
import { Task, TaskStatus } from '../../core/models/task.interface';
import { Comment } from '../../core/models/comment.interface';
import { SimpleTaskDialogComponent } from './simple-task-dialog.component';
import { TaskDetailDialogComponent, TaskDetailDialogData } from './task-detail-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatExpansionModule,
    MatChipsModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    FullCalendarModule,
    NgChartsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private taskService = inject(TaskService);
  private commentService = inject(CommentService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Signals for state management
  readonly loading = signal(false);
  readonly error = signal<string>('');
  readonly tasks = signal<Task[]>([]);
  readonly taskComments = signal<{ [taskId: number]: Comment[] }>({});
  readonly expandedTasks = signal<Set<number>>(new Set());
  readonly commentForms = signal<{ [taskId: number]: FormGroup }>({});
  readonly addingComments = signal<{ [taskId: number]: boolean }>({});

  // User data
  readonly currentUser = computed(() => this.authService.getCurrentUser());

  // Calendar
  readonly calendarPlugins = [dayGridPlugin];
  readonly calendarEvents = signal<any[]>([]);
  readonly calendarOptions = computed(() => ({
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    height: '400px',
    events: this.calendarEvents(),
    dateClick: (arg: any) => this.onDateClick(arg),
    eventClick: (arg: any) => this.onEventClick(arg)
  }));

  // Dashboard metrics
  readonly metrics = computed(() => {
    const tasks = this.tasks();
    return [
      { 
        label: 'Total Tasks', 
        value: tasks.length, 
        icon: 'assignment', 
        class: 'stat-blue' 
      },
      { 
        label: 'Pending', 
        value: tasks.filter(t => t.status === TaskStatus.PENDING).length, 
        icon: 'schedule', 
        class: 'stat-yellow' 
      },
      { 
        label: 'Approved', 
        value: tasks.filter(t => t.status === TaskStatus.APPROVED).length, 
        icon: 'check_circle', 
        class: 'stat-green' 
      },
      { 
        label: 'Completed', 
        value: tasks.filter(t => t.status === TaskStatus.COMPLETED).length, 
        icon: 'done_all', 
        class: 'stat-purple' 
      }
    ];
  });

  // Bar chart data (Tasks per User)
  readonly barChartData = computed((): ChartData<'bar'> => {
    const tasks = this.tasks();
    const userMap: { [user: string]: number } = {};
    
    tasks.forEach(task => {
      const userName = task.userFullName || 'Unassigned';
      userMap[userName] = (userMap[userName] || 0) + 1;
    });

    return {
      labels: Object.keys(userMap),
      datasets: [{
        label: 'Tasks',
        data: Object.values(userMap),
        backgroundColor: '#1976d2',
        borderRadius: 6
      }]
    };
  });

  readonly barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { maxRotation: 45 }
      },
      y: { 
        beginAtZero: true, 
        grid: { color: '#e0e0e0' } 
      }
    }
  };

  // Pie chart data (Tasks by Status)
  readonly pieChartData = computed((): ChartData<'pie'> => {
    const tasks = this.tasks();
    const statusMap: { [status: string]: number } = {};
    
    tasks.forEach(task => {
      statusMap[task.status] = (statusMap[task.status] || 0) + 1;
    });

    return {
      labels: Object.keys(statusMap),
      datasets: [{
        data: Object.values(statusMap),
        backgroundColor: [
          '#ff9800', // Pending
          '#4caf50', // Approved
          '#f44336', // Rejected
          '#2196f3'  // Completed
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  });

  readonly pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    }
  };

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.loading.set(true);
    this.error.set('');

    this.taskService.getMyTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.updateCalendarEvents(tasks);
        
        // Load comments for all tasks
        this.loadCommentsForAllTasks(tasks);
        
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load dashboard data');
        this.loading.set(false);
      }
    });
  }

  private loadCommentsForAllTasks(tasks: Task[]): void {
    // Load comments for each task
    tasks.forEach(task => {
      this.loadTaskComments(task.id);
    });
  }

  private updateCalendarEvents(tasks: Task[]): void {
    const events = tasks.map(task => ({
      id: task.id.toString(),
      title: task.title,
      date: task.date,
      backgroundColor: this.getStatusColor(task.status),
      borderColor: this.getStatusColor(task.status),
      extendedProps: {
        status: task.status,
        priority: task.priority,
        type: task.type
      }
    }));
    this.calendarEvents.set(events);
  }

  private getStatusColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.COMPLETED:
        return '#4caf50';
      case TaskStatus.APPROVED:
        return '#2196f3';
      case TaskStatus.PENDING:
        return '#ff9800';
      case TaskStatus.REJECTED:
        return '#f44336';
      default:
        return '#1976d2';
    }
  }

  onDateClick(arg: any): void {
    const dialogRef = this.dialog.open(SimpleTaskDialogComponent, {
      width: '500px',
      data: { date: arg.dateStr }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchDashboardData();
      }
    });
  }

  onEventClick(arg: any): void {
    const taskId = parseInt(arg.event.id);
    this.viewTaskDetails(taskId);
  }

  createNewTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  viewTask(taskId: number): void {
    this.router.navigate(['/tasks', taskId]);
  }

  viewTaskDetails(taskId: number): void {
    const task = this.tasks().find(t => t.id === taskId);
    if (task) {
      const dialogRef = this.dialog.open(TaskDetailDialogComponent, {
        width: '90vw',
        maxWidth: '900px',
        height: '90vh',
        maxHeight: '800px',
        data: { task } as TaskDetailDialogData
      });

      dialogRef.afterClosed().subscribe(() => {
        // Refresh comments if needed
        this.loadTaskComments(taskId);
      });
    }
  }

  toggleTaskExpansion(taskId: number): void {
    const expanded = this.expandedTasks();
    if (expanded.has(taskId)) {
      expanded.delete(taskId);
    } else {
      expanded.add(taskId);
      this.loadTaskComments(taskId);
    }
    this.expandedTasks.set(new Set(expanded));
  }

  loadTaskComments(taskId: number): void {
    // Only load if not already loaded or if we need to refresh
    const currentComments = this.taskComments()[taskId];
    if (currentComments && currentComments.length > 0) {
      console.log(`📝 Comments already loaded for task ${taskId}:`, currentComments.length);
      return;
    }

    console.log(`🔄 Loading comments for task ${taskId}...`);
    this.commentService.getCommentsByTask(taskId).subscribe({
      next: (comments) => {
        console.log(`✅ Loaded ${comments.length} comments for task ${taskId}:`, comments);
        this.taskComments.update(current => ({
          ...current,
          [taskId]: comments
        }));
      },
      error: (err) => {
        console.error(`❌ Error loading comments for task ${taskId}:`, err);
        // Set empty array to avoid repeated API calls
        this.taskComments.update(current => ({
          ...current,
          [taskId]: []
        }));
      }
    });
  }

  isTaskExpanded(taskId: number): boolean {
    return this.expandedTasks().has(taskId);
  }

  getTaskComments(taskId: number): Comment[] {
    return this.taskComments()[taskId] || [];
  }

  getCommentForm(taskId: number): FormGroup {
    let forms = this.commentForms();
    if (!forms[taskId]) {
      forms[taskId] = this.fb.group({
        content: ['', [Validators.required, Validators.minLength(1)]]
      });
      this.commentForms.set(forms);
    }
    return forms[taskId];
  }

  isAddingComment(taskId: number): boolean {
    return this.addingComments()[taskId] || false;
  }

  addCommentInline(taskId: number): void {
    const form = this.getCommentForm(taskId);
    if (form.valid) {
      this.addingComments.update(current => ({ ...current, [taskId]: true }));
      
      const commentData = {
        content: form.value.content,
        taskId: taskId
      };

      console.log('🔄 Adding inline comment:', commentData);

      this.commentService.createComment(commentData).subscribe({
        next: (newComment) => {
          console.log('✅ Inline comment created successfully:', newComment);
          
          // Update comments list
          this.taskComments.update(current => ({
            ...current,
            [taskId]: [newComment, ...(current[taskId] || [])]
          }));
          
          // Reset form
          form.reset();
          
          // Update adding status
          this.addingComments.update(current => ({ ...current, [taskId]: false }));
          
          // Show success message
          this.snackBar.open('Comment posted successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('❌ Error creating inline comment:', err);
          
          // Update adding status
          this.addingComments.update(current => ({ ...current, [taskId]: false }));
          
          // Show error message
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
      console.log('❌ Form invalid for task:', taskId);
      this.snackBar.open('Please fill in the comment correctly', 'Close', { duration: 3000 });
    }
  }
}
