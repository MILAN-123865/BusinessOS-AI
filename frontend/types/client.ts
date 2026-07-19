export interface Contact {
  id: string
  client_id?: string
  name: string
  designation?: string
  email: string
  phone?: string
  is_primary: boolean
  created_at?: string
  updated_at?: string
}

export interface Client {
  id: string
  organization_id: string
  company_name: string
  client_code?: string
  industry?: string
  website?: string
  email?: string
  phone?: string
  status: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  tax_number?: string
  registration_number?: string
  notes?: string
  created_at?: string
  updated_at?: string
  contacts: Contact[]
}
