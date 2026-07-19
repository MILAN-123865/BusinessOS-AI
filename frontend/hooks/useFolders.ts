import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFoldersApi, createFolderApi, updateFolderApi, deleteFolderApi } from '../api/folder'
import { CreateFolderPayload, UpdateFolderPayload } from '../types/folder'

export function useFolders() {
  return useQuery({
    queryKey: ['folders'],
    queryFn: getFoldersApi,
  })
}

export function useCreateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateFolderPayload) => createFolderApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
    },
  })
}

export function useUpdateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFolderPayload }) =>
      updateFolderApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useDeleteFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteFolderApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}
