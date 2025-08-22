import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { TeamService } from '../../../core/team/team.service';
import { Team } from '../../../core/models/team.interface';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private teamService = inject(TeamService);

  readonly team = signal<Team | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string>('');

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    
    this.teamService.getTeamById(id).subscribe({
      next: (team) => {
        this.team.set(team);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load team');
        this.loading.set(false);
      }
    });
  }

  editTeam() {
    const team = this.team();
    if (team) {
      this.router.navigate(['/teams', team.id, 'edit']);
    }
  }

  deleteTeam() {
    const team = this.team();
    if (team && confirm('Are you sure you want to delete this team?')) {
      this.teamService.deleteTeam(team.id).subscribe({
        next: () => this.router.navigate(['/teams']),
        error: (err) => this.error.set(err.error?.message || 'Failed to delete team')
      });
    }
  }
}
