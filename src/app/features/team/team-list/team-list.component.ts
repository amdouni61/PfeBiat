import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamService } from '../../../core/team/team.service';
import { Team } from '../../../core/models/team.interface';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamListComponent implements OnInit {
  private teamService = inject(TeamService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string>('');
  readonly teams = signal<Team[]>([]);
  readonly showCreateForm = signal(false);

  readonly displayedColumns = ['name', 'description', 'memberCount', 'actions'];
  readonly isAdmin = computed(() => this.authService.isAdmin());

  createTeamForm: FormGroup;

  constructor() {
    this.createTeamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.loading.set(true);
    this.error.set('');

    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        this.teams.set(teams);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load teams');
        this.loading.set(false);
        this.snackBar.open('Error loading teams', 'Close', { duration: 3000 });
      }
    });
  }

  createTeam(): void {
    if (this.createTeamForm.valid) {
      this.loading.set(true);
      this.teamService.createTeam(this.createTeamForm.value).subscribe({
        next: (team) => {
          this.teams.update(teams => [...teams, team]);
          this.createTeamForm.reset();
          this.showCreateForm.set(false);
          this.loading.set(false);
          this.snackBar.open('Team created successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to create team');
          this.loading.set(false);
          this.snackBar.open('Error creating team', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteTeam(teamId: number): void {
    if (confirm('Are you sure you want to delete this team?')) {
      this.loading.set(true);
      this.teamService.deleteTeam(teamId).subscribe({
        next: () => {
          this.teams.update(teams => teams.filter(team => team.id !== teamId));
          this.loading.set(false);
          this.snackBar.open('Team deleted successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to delete team');
          this.loading.set(false);
          this.snackBar.open('Error deleting team', 'Close', { duration: 3000 });
        }
      });
    }
  }

  viewTeam(teamId: number): void {
    this.router.navigate(['/teams', teamId]);
  }

  editTeam(teamId: number): void {
    this.router.navigate(['/teams', teamId, 'edit']);
  }
}
