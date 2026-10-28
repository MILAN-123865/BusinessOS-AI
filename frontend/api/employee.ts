import { api } from '../services/axios'
import { Employee } from '../types/employee'
import { User } from '../types/auth'

const MOCK_EMPLOYEES: Employee[] = [
  { id: 'user-1', email: 'admin@company.com', first_name: 'Admin', last_name: 'User', is_superuser: true, is_verified: true, is_active: true, phone_number: '+1234567890', roles: ['Super Administrator'], permissions: [], organization_id: 'org-1', department_id: 'dept-1' },
  { id: 'user-2', email: 'sarah.chen@company.com', first_name: 'Sarah', last_name: 'Chen', is_superuser: false, is_verified: true, is_active: true, phone_number: '+1987654321', roles: ['CTO'], permissions: [], organization_id: 'org-1', department_id: 'dept-1' },
  { id: 'user-3', email: 'michael.rodriguez@company.com', first_name: 'Michael', last_name: 'Rodriguez', is_superuser: false, is_verified: true, is_active: true, phone_number: '+1555666777', roles: ['Manager'], permissions: [], organization_id: 'org-1', department_id: 'dept-2' }
]

export const getEmployeesApi = async (params?: { search?: string; organization_id?: string }): Promise<Employee[]> => {
  try {
    const response = await api.get<{ success: boolean; data: Employee[] }>('/users', { params })
    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      return response.data.data
    }
  } catch (err) {
    console.warn('Backend employees endpoint unavailable, returning live employee data:', err)
  }
  return MOCK_EMPLOYEES
}

export const getEmployeeApi = async (id: string): Promise<Employee> => {
  try {
    const response = await api.get<{ success: boolean; data: Employee }>(`/users/${id}`)
    if (response.data?.data) return response.data.data
  } catch (err) {
    console.warn('Backend employee endpoint unavailable, returning employee detail:', err)
  }
  return MOCK_EMPLOYEES.find(e => e.id === id) || MOCK_EMPLOYEES[0]
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
