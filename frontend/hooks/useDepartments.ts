import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDepartmentsApi,
  getDepartmentApi,
  getOrganizationDepartmentsApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
  getDepartmentEmployeesApi,
} from '../api/department'
import { Department } from '../types/department'

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: getDepartmentsApi,
  })
}

export function useDepartment(id: string) {
  return useQuery({
    queryKey: ['department', id],
    queryFn: () => getDepartmentApi(id),
    enabled: !!id,
  })
}

export function useOrganizationDepartments(orgId: string) {
  return useQuery({
    queryKey: ['departments', 'organization', orgId],
    queryFn: () => getOrganizationDepartmentsApi(orgId),
    enabled: !!orgId,
  })
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<Department>) => createDepartmentApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Department> }) =>
      updateDepartmentApi(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      queryClient.invalidateQueries({ queryKey: ['department', variables.id] })
    },
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDepartmentApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}

export function useDepartmentEmployees(id: string) {
  return useQuery({
    queryKey: ['department', id, 'employees'],
    queryFn: () => getDepartmentEmployeesApi(id),
    enabled: !!id,
  })
}

export function useOrganizationEmployees(orgId: string) {
  return useQuery({
    queryKey: ['employees', 'organization', orgId],
    queryFn: async () => {
      const { api } = await import('../services/axios')
      const response = await api.get<{ success: boolean; data: any[] }>(`/users?organization_id=${orgId}`)
      return response.data.data
    },
    enabled: !!orgId,
  })
}
