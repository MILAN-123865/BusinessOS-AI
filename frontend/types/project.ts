import { Client } from './client'
import { User } from './auth'

export interface ProjectMilestone {
  id: string
  project_id: string
  name: string
  description?: string
  due_date?: string
  status: string
  created_at?: string
  updated_at?: string
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role?: string
  user: User
  created_at?: string
  updated_at?: string
}

export interface Project {
  id: string
  organization_id: string
  client_id: string
  name: string
  project_code?: string
  description?: string
  status: string
  priority: string
  budget: number
  currency: string
  start_date?: string
  end_date?: string
  estimated_hours: number
  actual_hours: number
  progress: number
  health: string
  project_manager_id?: string
  created_at?: string
  updated_at?: string
  client?: Client
  project_manager?: User
  members: ProjectMember[]
  milestones: ProjectMilestone[]
}
