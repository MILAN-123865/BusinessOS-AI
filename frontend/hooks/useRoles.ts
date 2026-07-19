import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRolesApi,
  getRoleApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
  getPermissionsApi,
} from '../api/role'

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: getRolesApi,
  })
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => getRoleApi(id),
    enabled: !!id,
  })
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissionsApi,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { name: string; description?: string; permission_ids?: string[] }) =>
      createRoleApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; description?: string; permission_ids?: string[] } }) =>
      updateRoleApi(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['role', variables.id] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRoleApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}
