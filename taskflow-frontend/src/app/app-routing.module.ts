import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TaskListComponent } from './features/task/task-list/task-list.component';
import { TaskFormComponent } from './features/task/task-form/task-form.component';
import { TaskDetailComponent } from './features/task/task-detail/task-detail.component';
import { TeamListComponent } from './features/team/team-list/team-list.component';
import { TeamDetailComponent } from './features/team/team-detail/team-detail.component';
import { CommentListComponent } from './features/comment/comment-list/comment-list.component';
import { UserProfileComponent } from './features/user/user-profile/user-profile.component';
import { UserSettingsComponent } from './features/user/user-settings/user-settings.component';
import { UserManagementComponent } from './features/admin/user-management/user-management.component';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'tasks', component: TaskListComponent, canActivate: [AuthGuard] },
  { path: 'tasks/new', component: TaskFormComponent, canActivate: [AuthGuard] },
  { path: 'tasks/:id', component: TaskDetailComponent, canActivate: [AuthGuard] },
  { path: 'tasks/:id/edit', component: TaskFormComponent, canActivate: [AuthGuard] },
  { path: 'teams', component: TeamListComponent, canActivate: [AuthGuard] },
  { path: 'teams/:id', component: TeamDetailComponent, canActivate: [AuthGuard] },
  { path: 'comments', component: CommentListComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: UserSettingsComponent, canActivate: [AuthGuard] },
  { path: 'admin/users', component: UserManagementComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
