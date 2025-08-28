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
  submittedAt?: string;
  validatedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export enum TaskStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TaskType {
  DEVELOPMENT = 'DEVELOPMENT',
  TESTING = 'TESTING',
  MEETING = 'MEETING',
  PLANNING = 'PLANNING',
  SUPPORT = 'SUPPORT',
  DOCUMENTATION = 'DOCUMENTATION',
  MAINTENANCE = 'MAINTENANCE',
  DEPLOYMENT = 'DEPLOYMENT',
  TRAINING = 'TRAINING',
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

export interface SubmitTaskRequest {
  taskId: number;
}

export interface TaskApprovalRequest {
  taskId: number;
  approved: boolean;
  comment?: string;
  rejectionReason?: string;
}

export interface TaskValidationRequest {
  taskId: number;
  validated: boolean;
  comment?: string;
  rejectionReason?: string;
} 