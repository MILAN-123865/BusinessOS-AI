import { api } from '../services/axios'
import { Permission } from '../types/permission'
import { Role } from '../types/role'

export const getPermissionsApi = async (): Promise<Permission[]> => {
  const response = await api.get<{ success: boolean; data: Permission[] }>('/permissions')
  return response.data.data
}

export const getPermissionApi = async (id: string): Promise<Permission> => {
  const response = await api.get<{ success: boolean; data: Permission }>(`/permissions/${id}`)
  return response.data.data
}

export const getPermissionModulesApi = async (): Promise<string[]> => {
  const response = await api.get<{ success: boolean; data: string[] }>('/permissions/modules')
  return response.data.data
}

export const getPermissionActionsApi = async (): Promise<string[]> => {
  const response = await api.get<{ success: boolean; data: string[] }>('/permissions/actions')
  return response.data.data
}

export const getPermissionRolesApi = async (id: string): Promise<Role[]> => {
  const response = await api.get<{ success: boolean; data: Role[] }>(`/permissions/${id}/roles`)
  return response.data.data
}

export const createPermissionApi = async (payload: { name: string; description?: string }): Promise<Permission> => {
  const response = await api.post<{ success: boolean; data: Permission }>('/permissions', payload)
  return response.data.data
}

export const updatePermissionApi = async (id: string, payload: { description?: string }): Promise<Permission> => {
  const response = await api.patch<{ success: boolean; data: Permission }>(`/permissions/${id}`, payload)
  return response.data.data
}

export const deletePermissionApi = async (id: string): Promise<Permission> => {
  const response = await api.delete<{ success: boolean; data: Permission }>(`/permissions/${id}`)
  return response.data.data
}
