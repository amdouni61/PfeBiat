import { Team } from './team.interface';

export interface User {
  id: number;
  email: string;
  fullName: string;
  username: string;
  role: UserRole;
  enabled: boolean;
  avatarUrl?: string;
  teamId?: number;
  teamName?: string;
  lastActivityAt?: string;
  isHidden: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  username: string;
  role: UserRole;
  avatarUrl?: string;
  teamId?: number;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  username?: string;
  role?: UserRole;
  enabled?: boolean;
  avatarUrl?: string;
  teamId?: number;
}

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'USER';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user?: User;
}

export interface ErrorResponse {
  code: string;
  message: string;
} 