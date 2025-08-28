import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskStatus } from '../models/task.interface';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/tasks';

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTasksByUser(userId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/by-user/${userId}`);
  }

  getTasksBySupervisor(supervisorId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/by-supervisor/${supervisorId}`);
  }

  getTasksByStatus(status: TaskStatus): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/by-status/${status}`);
  }

  getTasksByDate(date: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/by-date/${date}`);
  }

  getTasksByDateRange(startDate: string, endDate: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/by-date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  submitTaskForValidation(taskId: number): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${taskId}/submit`, {});
  }

  validateTask(taskId: number, approved: boolean, comment?: string, rejectionReason?: string): Observable<Task> {
    const request = {
      approved,
      comment: comment || '',
      rejectionReason: rejectionReason || ''
    };
    return this.http.post<Task>(`${this.apiUrl}/${taskId}/validate`, request);
  }

  getTasksPendingValidation(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/pending-validation`);
  }

  getMyDraftTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/my-tasks/draft`);
  }

  getMySubmittedTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/my-tasks/submitted`);
  }

  getMyTasksByStatus(status: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/my-tasks/status/${status}`);
  }

  approveTask(id: number, comment?: string): Observable<Task> {
    const commentData = comment ? { content: comment } : {};
    return this.http.put<Task>(`${this.apiUrl}/${id}/approve`, commentData);
  }

  rejectTask(id: number, comment: string): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}/reject`, { content: comment });
  }

  getCurrentUserTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/my-tasks`);
  }

  getDashboardTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/dashboard`);
  }
}
