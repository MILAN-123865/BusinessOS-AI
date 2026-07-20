export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  website?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  is_active: boolean
  created_at: string
  updated_at: string
}
