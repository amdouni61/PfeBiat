import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/export';

  exportTasksPDF(title: string = 'All Tasks Report'): Observable<Blob> {
    return this.http.get(`${this.API_URL}/pdf/tasks?title=${encodeURIComponent(title)}`, {
      responseType: 'blob'
    });
  }

  exportTasksExcel(sheetName: string = 'Tasks'): Observable<Blob> {
    return this.http.get(`${this.API_URL}/excel/tasks?sheetName=${encodeURIComponent(sheetName)}`, {
      responseType: 'blob'
    });
  }

  exportDashboardPDF(title: string = 'Dashboard Report'): Observable<Blob> {
    return this.http.get(`${this.API_URL}/pdf/dashboard?title=${encodeURIComponent(title)}`, {
      responseType: 'blob'
    });
  }

  exportDashboardExcel(sheetName: string = 'Dashboard'): Observable<Blob> {
    return this.http.get(`${this.API_URL}/excel/dashboard?sheetName=${encodeURIComponent(sheetName)}`, {
      responseType: 'blob'
    });
  }

  exportTaskDetailsPDF(taskId: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/pdf/task/${taskId}`, {
      responseType: 'blob'
    });
  }

  exportTaskDetailsExcel(taskId: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/excel/task/${taskId}`, {
      responseType: 'blob'
    });
  }

  exportTeamPerformancePDF(title: string = 'Team Performance Report'): Observable<Blob> {
    return this.http.get(`${this.API_URL}/pdf/team-performance?title=${encodeURIComponent(title)}`, {
      responseType: 'blob'
    });
  }

  exportTeamPerformanceExcel(sheetName: string = 'Team Performance'): Observable<Blob> {
    return this.http.get(`${this.API_URL}/excel/team-performance?sheetName=${encodeURIComponent(sheetName)}`, {
      responseType: 'blob'
    });
  }

  exportFilteredTasksPDF(filters: any, title: string = 'Filtered Tasks Report'): Observable<Blob> {
    return this.http.post(`${this.API_URL}/pdf/tasks/filtered?title=${encodeURIComponent(title)}`, filters, {
      responseType: 'blob'
    });
  }

  exportFilteredTasksExcel(filters: any, sheetName: string = 'Filtered Tasks'): Observable<Blob> {
    return this.http.post(`${this.API_URL}/excel/tasks/filtered?sheetName=${encodeURIComponent(sheetName)}`, filters, {
      responseType: 'blob'
    });
  }

  exportUserTasksPDF(userId: number, title: string = 'User Tasks Report'): Observable<Blob> {
    return this.http.get(`${this.API_URL}/pdf/user/${userId}/tasks?title=${encodeURIComponent(title)}`, {
      responseType: 'blob'
    });
  }

  exportUserTasksExcel(userId: number, sheetName: string = 'User Tasks'): Observable<Blob> {
    return this.http.get(`${this.API_URL}/excel/user/${userId}/tasks?sheetName=${encodeURIComponent(sheetName)}`, {
      responseType: 'blob'
    });
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  openFileInNewTab(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    window.URL.revokeObjectURL(url);
  }
} 