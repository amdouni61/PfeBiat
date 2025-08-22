import { User } from './user.interface';
import { Comment } from './comment.interface';

export interface Task {
  id: number;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  date: string;
  startTime?: string;
  endTime?: string;
  deadline?: string;
  attachmentUrl?: string;
  userId: number;
  username: string;
  userFullName: string;
  userAvatarUrl?: string;
  supervisorId?: number;
  supervisorUsername?: string;
  supervisorFullName?: string;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export enum TaskStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum TaskType {
  DEVELOPMENT = 'DEVELOPMENT',
  TESTING = 'TESTING',
  MEETING = 'MEETING',
  PLANNING = 'PLANNING',
  SUPPORT = 'SUPPORT',
  DOCUMENTATION = 'DOCUMENTATION',
  OTHER = 'OTHER'
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  date: string;
  startTime?: string;
  endTime?: string;
  deadline?: string;
  attachmentUrl?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  date?: string;
  startTime?: string;
  endTime?: string;
  deadline?: string;
  attachmentUrl?: string;
}

export interface TaskApprovalRequest {
  comment?: string;
} 