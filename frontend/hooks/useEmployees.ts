import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEmployeesApi,
  getEmployeeApi,
  createEmployeeApi,
  updateEmployeeApi,
  deleteEmployeeApi,
  updateEmployeeRolesApi,
  updateEmployeeDepartmentApi,
  updateEmployeeStatusApi,
  inviteEmployeeApi,
  bulkImportEmployeesApi,
  exportEmployeesApi,
} from '../api/employee'
import { User } from '../types/auth'

export function useEmployees(params?: { search?: string; organization_id?: string }) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => getEmployeesApi(params),
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployeeApi(id),
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<User> & { password?: string }) => createEmployeeApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) =>
      updateEmployeeApi(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteEmployeeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useUpdateEmployeeRoles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      updateEmployeeRolesApi(id, roleIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] })
    },
  })
}

export function useUpdateEmployeeDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, departmentId }: { id: string; departmentId: string | null }) =>
      updateEmployeeDepartmentApi(id, departmentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] })
    },
  })
}

export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateEmployeeStatusApi(id, isActive),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] })
    },
  })
}

export function useInviteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<User> & { password?: string }) => inviteEmployeeApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useBulkImportEmployees() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payloads: any[]) => bulkImportEmployeesApi(payloads),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useExportEmployees() {
  return useQuery({
    queryKey: ['exportEmployees'],
    queryFn: exportEmployeesApi,
    enabled: false, // manual triggers
  })
}
