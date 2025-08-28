import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
import { TaskValidationComponent } from './features/task/task-validation/task-validation.component';
import { UserListComponent } from './features/user/user-list/user-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [AuthGuard] },
  { path: 'tasks', loadComponent: () => import('./features/task/task-list/task-list.component').then(m => m.TaskListComponent), canActivate: [AuthGuard] },
  { path: 'task-validation', component: TaskValidationComponent, canActivate: [AuthGuard] },
  { path: 'teams', loadComponent: () => import('./features/team/team-list/team-list.component').then(m => m.TeamListComponent), canActivate: [AuthGuard] },
  { path: 'users', component: UserListComponent, canActivate: [AuthGuard] },
  { path: 'comments', loadComponent: () => import('./features/comment/comment-list/comment-list.component').then(m => m.CommentListComponent), canActivate: [AuthGuard] },
  { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent), canActivate: [AuthGuard] },
  { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent), canActivate: [AuthGuard] },
  { path: 'chat', loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent), canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/dashboard' }
];

export { routes };
