import { User } from './auth'

export interface Department {
  id: string
  organization_id: string
  name: string
  code?: string
  description?: string
  manager_id?: string
  manager?: User
  is_active: boolean
  created_at: string
  updated_at: string
}
