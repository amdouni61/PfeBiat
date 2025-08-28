import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="settings-container">
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>settings</mat-icon>
            Settings
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Settings page coming soon...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    .settings-card {
      margin-top: 20px;
    }
  `]
})
export class SettingsComponent {
}
