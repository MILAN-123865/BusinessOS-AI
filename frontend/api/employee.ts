import { api } from '../services/axios'
import { Employee } from '../types/employee'
import { User } from '../types/auth'

export const getEmployeesApi = async (params?: { search?: string; organization_id?: string }): Promise<Employee[]> => {
  const response = await api.get<{ success: boolean; data: Employee[] }>('/users', { params })
  return response.data.data
}

export const getEmployeeApi = async (id: string): Promise<Employee> => {
  const response = await api.get<{ success: boolean; data: Employee }>(`/users/${id}`)
  return response.data.data
}

export const createEmployeeApi = async (payload: Partial<User> & { password?: string }): Promise<Employee> => {
  const response = await api.post<{ success: boolean; data: Employee }>('/users', payload)
  return response.data.data
}

export const updateEmployeeApi = async (id: string, payload: Partial<User>): Promise<Employee> => {
  const response = await api.patch<{ success: boolean; data: Employee }>(`/users/${id}`, payload)
  return response.data.data
}

export const deleteEmployeeApi = async (id: string): Promise<Employee> => {
  const response = await api.delete<{ success: boolean; data: Employee }>(`/users/${id}`)
  return response.data.data
}

export const updateEmployeeRolesApi = async (id: string, roleIds: string[]): Promise<Employee> => {
  const response = await api.patch<{ success: boolean; data: Employee }>(`/users/${id}/roles`, roleIds)
  return response.data.data
}

export const updateEmployeeDepartmentApi = async (id: string, departmentId: string | null): Promise<Employee> => {
  const response = await api.patch<{ success: boolean; data: Employee }>(
    `/users/${id}/department`,
    null,
    { params: { department_id: departmentId } }
  )
  return response.data.data
}

export const updateEmployeeStatusApi = async (id: string, isActive: boolean): Promise<Employee> => {
  const response = await api.patch<{ success: boolean; data: Employee }>(
    `/users/${id}/status`,
    null,
    { params: { is_active: isActive } }
  )
  return response.data.data
}

export const inviteEmployeeApi = async (payload: Partial<User> & { password?: string }): Promise<Employee> => {
  const response = await api.post<{ success: boolean; data: Employee }>('/users/invite', payload)
  return response.data.data
}

export const bulkImportEmployeesApi = async (payloads: any[]): Promise<Employee[]> => {
  const response = await api.post<{ success: boolean; data: Employee[] }>('/users/bulk-import', payloads)
  return response.data.data
}

export const exportEmployeesApi = async (): Promise<Employee[]> => {
  const response = await api.get<{ success: boolean; data: Employee[] }>('/users/export')
  return response.data.data
}
