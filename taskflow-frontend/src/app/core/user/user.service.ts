import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/admin';

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  createUser(userData: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, userData);
  }

  updateUser(id: number, userData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  updateUserRole(id: number, role: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}/role?role=${role}`, {});
  }

  // New methods for user deactivation
  hideUser(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${id}/hide`, {});
  }

  unhideUser(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${id}/unhide`, {});
  }

  isUserHidden(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/users/${id}/hidden-status`);
  }
}
