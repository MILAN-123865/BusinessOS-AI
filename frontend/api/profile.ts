import { api } from '../services/axios'
import { User } from '../types/auth'

export interface ProfileUpdatePayload {
  first_name?: string
  last_name?: string
  phone_number?: string
  password?: string
}

export const updateProfileApi = async (payload: ProfileUpdatePayload): Promise<User> => {
  const response = await api.patch<{ success: boolean; data: User }>('/users/me', payload)
  return response.data.data
}
