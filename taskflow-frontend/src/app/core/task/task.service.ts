import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskApprovalRequest } from '../models/task.interface';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/api/tasks';
  private http = inject(HttpClient);

  // Basic CRUD operations
  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Task filtering operations
  getTasksByUser(userId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/by-user/${userId}`);
  }

  getTasksBySupervisor(supervisorId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/by-supervisor/${supervisorId}`);
  }

  getTasksByStatus(status: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/by-status/${status}`);
  }

  getTasksByDate(date: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/by-date/${date}`);
  }

  getTasksByDateRange(startDate: string, endDate: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/by-date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  // Task approval operations
  approveTask(id: number, comment?: string): Observable<Task> {
    const request: TaskApprovalRequest = comment ? { comment } : {};
    return this.http.put<Task>(`${this.apiUrl}/${id}/approve`, request);
  }

  rejectTask(id: number, comment: string): Observable<Task> {
    const request: TaskApprovalRequest = { comment };
    return this.http.put<Task>(`${this.apiUrl}/${id}/reject`, request);
  }

  // Current user operations
  getMyTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/my-tasks`);
  }

  getTasksPendingValidation(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/pending-validation`);
  }
}
