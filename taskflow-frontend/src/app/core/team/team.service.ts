import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from '../models/team.interface';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/teams';

  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  getTeamById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${id}`);
  }

  createTeam(teamData: any): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, teamData);
  }

  updateTeam(id: number, teamData: any): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/${id}`, teamData);
  }

  deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTeamsByUser(userId: number): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/user/${userId}`);
  }

  addMemberToTeam(teamId: number, userId: number): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/${teamId}/members/${userId}`, {});
  }

  removeMemberFromTeam(teamId: number, userId: number): Observable<Team> {
    return this.http.delete<Team>(`${this.apiUrl}/${teamId}/members/${userId}`);
  }
}
