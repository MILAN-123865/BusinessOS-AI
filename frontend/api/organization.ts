import { api } from '../services/axios'
import { Organization } from '../types/organization'

export const getOrganizationsApi = async (): Promise<Organization[]> => {
  const response = await api.get<{ success: boolean; data: Organization[] }>('/organizations')
  return response.data.data
}

export const getCurrentOrganizationApi = async (): Promise<Organization> => {
  const response = await api.get<{ success: boolean; data: Organization }>('/organizations/current')
  return response.data.data
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
