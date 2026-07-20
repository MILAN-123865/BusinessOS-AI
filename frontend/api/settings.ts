import { api } from '../services/axios'
import { SystemSettings } from '../types/settings'

export const getSystemSettingsApi = async (): Promise<SystemSettings> => {
  const response = await api.get<{ success: boolean; data: SystemSettings }>('/settings')
  return response.data.data
}

export const updateSystemSettingsApi = async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await api.patch<{ success: boolean; data: SystemSettings }>('/settings', data)
  return response.data.data
}
