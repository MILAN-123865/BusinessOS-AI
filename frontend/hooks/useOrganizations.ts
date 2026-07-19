import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getOrganizationsApi,
  getCurrentOrganizationApi,
  createOrganizationApi,
  updateCurrentOrganizationApi,
  updateOrganizationApi,
  deleteOrganizationApi,
} from '../api/organization'
import { Organization } from '../types/organization'

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: getOrganizationsApi,
  })
}

export function useCurrentOrganization() {
  return useQuery({
    queryKey: ['currentOrganization'],
    queryFn: getCurrentOrganizationApi,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<Organization>) => createOrganizationApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}

export function useUpdateCurrentOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<Organization>) => updateCurrentOrganizationApi(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentOrganization'], data)
      queryClient.invalidateQueries({ queryKey: ['currentOrganization'] })
    },
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Organization> }) =>
      updateOrganizationApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteOrganizationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}
