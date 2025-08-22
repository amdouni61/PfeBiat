import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/navbar/navbar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'taskflow-frontend';

  constructor(public router: Router) {}

  showSidebar(): boolean {
    return !['/login', '/register'].includes(this.router.url);
  }
}
