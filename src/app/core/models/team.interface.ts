import { User } from './user.interface';

export interface Team {
  id: number;
  name: string;
  description?: string;
  teamLead?: User;
  members: User[];
  memberCount?: number;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  teamLeadId?: number;
  memberIds?: number[];
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  teamLeadId?: number;
  memberIds?: number[];
}

export interface AddUserToTeamRequest {
  userId: number;
}

export interface RemoveUserFromTeamRequest {
  userId: number;
} 