import { User } from './user.interface';

export interface Comment {
  id: number;
  content: string;
  taskId: number;
  taskTitle?: string;
  userId: number;
  userFullName: string;
  userAvatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  taskId: number;
}

export interface UpdateCommentRequest {
  content: string;
} 