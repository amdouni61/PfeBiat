import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialNavbarComponent } from './shared/material-navbar/material-navbar.component';
import { ChatBubbleComponent } from './shared/chat-bubble/chat-bubble.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, MaterialNavbarComponent, ChatBubbleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'taskflow-frontend';

  constructor(public router: Router) {}

  showSidebar(): boolean {
    return !['/login', '/register'].includes(this.router.url);
  }
}
