import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '../models/comment.interface';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:8080/api/comments';
  private http = inject(HttpClient);

  // Basic CRUD operations
  getAllComments(): Observable<Comment[]> {
    return this.http.get<Comment[]>(this.apiUrl);
  }

  getCommentById(id: number): Observable<Comment> {
    return this.http.get<Comment>(`${this.apiUrl}/${id}`);
  }

  createComment(comment: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment);
  }

  updateComment(id: number, comment: UpdateCommentRequest): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${id}`, comment);
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Task-specific operations
  getCommentsByTask(taskId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/by-task/${taskId}`);
  }

  getCommentsByUser(userId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/by-user/${userId}`);
  }
}
