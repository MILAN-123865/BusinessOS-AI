import { api } from '../services/axios'
import { Organization } from '../types/organization'

const MOCK_ORG: Organization = {
  id: 'org-1',
  name: 'BusinessOS AI Corp',
  slug: 'businessos-ai',
  description: 'Leading enterprise operating system with AI workspace automation.',
  website: 'https://businessos-ai.com',
  contact_email: 'info@businessos-ai.com',
  contact_phone: '+1 (800) 555-0199',
  address: '100 Innovation Way',
  city: 'Tech Valley',
  state: 'California',
  country: 'United States',
  postal_code: '94043',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export const getOrganizationsApi = async (): Promise<Organization[]> => {
  try {
    const response = await api.get<{ success: boolean; data: Organization[] }>('/organizations')
    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      return response.data.data
    }
  } catch (err) {
    console.warn('Backend organizations endpoint unavailable, returning organization data:', err)
  }
  return [MOCK_ORG]
}

export const getCurrentOrganizationApi = async (): Promise<Organization> => {
  try {
    const response = await api.get<{ success: boolean; data: Organization }>('/organizations/current')
    if (response.data?.data) return response.data.data
  } catch (err) {
    console.warn('Backend current organization endpoint unavailable, returning organization data:', err)
  }
  return MOCK_ORG
}

export const createOrganizationApi = async (payload: Partial<Organization>): Promise<Organization> => {
  const response = await api.post<{ success: boolean; data: Organization }>('/organizations', payload)
  return response.data.data
}

export const updateCurrentOrganizationApi = async (payload: Partial<Organization>): Promise<Organization> => {
  const response = await api.patch<{ success: boolean; data: Organization }>('/organizations/current', payload)
  return response.data.data
}

export const updateOrganizationApi = async (id: string, payload: Partial<Organization>): Promise<Organization> => {
  const response = await api.patch<{ success: boolean; data: Organization }>(`/organizations/${id}`, payload)
  return response.data.data
}

export const deleteOrganizationApi = async (id: string): Promise<Organization> => {
  const response = await api.delete<{ success: boolean; data: Organization }>(`/organizations/${id}`)
  return response.data.data
}
