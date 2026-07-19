import { api } from '../services/axios'
import { Department } from '../types/department'
import { User } from '../types/auth'

export const getDepartmentsApi = async (): Promise<Department[]> => {
  const response = await api.get<{ success: boolean; data: Department[] }>('/departments')
  return response.data.data
}

export const getDepartmentApi = async (id: string): Promise<Department> => {
  const response = await api.get<{ success: boolean; data: Department }>(`/departments/${id}`)
  return response.data.data
}

export const getOrganizationDepartmentsApi = async (orgId: string): Promise<Department[]> => {
  const response = await api.get<{ success: boolean; data: Department[] }>(`/departments/organization/${orgId}`)
  return response.data.data
}

export const createDepartmentApi = async (payload: Partial<Department>): Promise<Department> => {
  const response = await api.post<{ success: boolean; data: Department }>('/departments', payload)
  return response.data.data
}

export const updateDepartmentApi = async (id: string, payload: Partial<Department>): Promise<Department> => {
  const response = await api.patch<{ success: boolean; data: Department }>(`/departments/${id}`, payload)
  return response.data.data
}

export const deleteDepartmentApi = async (id: string): Promise<Department> => {
  const response = await api.delete<{ success: boolean; data: Department }>(`/departments/${id}`)
  return response.data.data
}

export const getDepartmentEmployeesApi = async (id: string): Promise<User[]> => {
  const response = await api.get<{ success: boolean; data: User[] }>(`/departments/${id}/employees`)
  return response.data.data
}
