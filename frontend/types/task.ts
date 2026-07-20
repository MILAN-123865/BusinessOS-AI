import { Project } from './project'
import { User } from './auth'

export interface Subtask {
  id: string
  task_id: string
  title: string
  is_completed: boolean
  created_at?: string
  updated_at?: string
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  user: User
  created_at?: string
  updated_at?: string
}

export interface Task {
  id: string
  organization_id: string
  project_id: string
  task_code?: string
  title: string
  description?: string
  assignee_id?: string
  status: string
  priority: string
  estimated_hours: number
  actual_hours: number
  progress: number
  start_date?: string
  due_date?: string
  completed_at?: string
  created_at?: string
  updated_at?: string
  project?: Project
  assignee?: User
  comments: Comment[]
  subtasks: Subtask[]
}
