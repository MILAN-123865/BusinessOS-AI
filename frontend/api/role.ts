import { api } from '../services/axios'
import { Role, Permission } from '../types/role'

export const getRolesApi = async (): Promise<Role[]> => {
  const response = await api.get<{ success: boolean; data: Role[] }>('/roles')
  return response.data.data
}

export const getRoleApi = async (id: string): Promise<Role> => {
  const response = await api.get<{ success: boolean; data: Role }>(`/roles/${id}`)
  return response.data.data
}

export const createRoleApi = async (payload: { name: string; description?: string; permission_ids?: string[] }): Promise<Role> => {
  const response = await api.post<{ success: boolean; data: Role }>('/roles', payload)
  return response.data.data
}

export const updateRoleApi = async (id: string, payload: { name?: string; description?: string; permission_ids?: string[] }): Promise<Role> => {
  const response = await api.patch<{ success: boolean; data: Role }>(`/roles/${id}`, payload)
  return response.data.data
}

export const deleteRoleApi = async (id: string): Promise<Role> => {
  const response = await api.delete<{ success: boolean; data: Role }>(`/roles/${id}`)
  return response.data.data
}

export const getPermissionsApi = async (): Promise<Permission[]> => {
  const response = await api.get<{ success: boolean; data: Permission[] }>('/permissions')
  return response.data.data
}
