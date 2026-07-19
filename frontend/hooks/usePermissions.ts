import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPermissionsApi,
  getPermissionApi,
  getPermissionModulesApi,
  getPermissionActionsApi,
  getPermissionRolesApi,
  createPermissionApi,
  updatePermissionApi,
  deletePermissionApi,
} from '../api/permission'

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissionsApi,
  })
}

export function usePermission(id: string) {
  return useQuery({
    queryKey: ['permission', id],
    queryFn: () => getPermissionApi(id),
    enabled: !!id,
  })
}

export function usePermissionModules() {
  return useQuery({
    queryKey: ['permissionModules'],
    queryFn: getPermissionModulesApi,
  })
}

export function usePermissionActions() {
  return useQuery({
    queryKey: ['permissionActions'],
    queryFn: getPermissionActionsApi,
  })
}

export function usePermissionRoles(id: string) {
  return useQuery({
    queryKey: ['permissionRoles', id],
    queryFn: () => getPermissionRolesApi(id),
    enabled: !!id,
  })
}

export function useCreatePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) => createPermissionApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
      queryClient.invalidateQueries({ queryKey: ['permissionModules'] })
      queryClient.invalidateQueries({ queryKey: ['permissionActions'] })
    },
  })
}

export function useUpdatePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { description?: string } }) =>
      updatePermissionApi(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
      queryClient.invalidateQueries({ queryKey: ['permission', variables.id] })
    },
  })
}

export function useDeletePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePermissionApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
      queryClient.invalidateQueries({ queryKey: ['permissionModules'] })
      queryClient.invalidateQueries({ queryKey: ['permissionActions'] })
    },
  })
}
