export interface Permission {
  id: string
  name: string
  code: string
  module: string
  action: string
  description?: string
  category: string
  is_system: boolean
  created_at?: string
  updated_at?: string
}
