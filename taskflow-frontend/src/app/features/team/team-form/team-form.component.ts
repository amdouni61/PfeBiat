import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from 'src/app/core/team/team.service';

@Component({
  selector: 'app-team-form',
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.scss']
})
export class TeamFormComponent implements OnInit {
  team: any = { name: '' };
  isEdit = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.teamService.getTeamById(Number(id)).subscribe({
        next: (team) => this.team = team,
        error: (err) => this.error = err.error?.message || 'Failed to load team'
      });
    }
  }

  saveTeam() {
    if (this.isEdit) {
      this.teamService.updateTeam(this.team.id, this.team).subscribe({
        next: () => this.router.navigate(['/teams']),
        error: (err) => this.error = err.error?.message || 'Failed to update team'
      });
    } else {
      this.teamService.createTeam(this.team).subscribe({
        next: () => this.router.navigate(['/teams']),
        error: (err) => this.error = err.error?.message || 'Failed to create team'
      });
    }
  }
}
