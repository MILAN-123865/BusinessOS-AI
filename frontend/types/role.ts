export interface Permission {
  id: string
  name: string
  description?: string
}

export interface Role {
  id: string
  name: string
  description?: string
  is_system: boolean
  permissions: Permission[]
  user_count: number
  created_at: string
  updated_at: string
}
