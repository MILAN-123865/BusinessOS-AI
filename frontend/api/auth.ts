import { api } from '../services/axios'
import { LoginResponse, User } from '../types/auth'

export const loginApi = async (username: string, password: string): Promise<LoginResponse> => {
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)

  const response = await api.post<LoginResponse>('/auth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return response.data
}

export const getMeApi = async (): Promise<User> => {
  const response = await api.get<{ success: boolean; data: User }>('/users/me')
  return response.data.data
}

export const refreshTokenApi = async (refreshToken: string): Promise<{ access_token: string }> => {
  // Use fetch or a separate axios instance without interceptors to avoid infinite loops
  const response = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!response.ok) {
    throw new Error('Refresh token failed')
  }

  return response.json()
}
