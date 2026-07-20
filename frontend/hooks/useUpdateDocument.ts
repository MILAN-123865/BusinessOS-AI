import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateDocumentApi, shareDocumentApi } from '../api/document'
import { UpdateDocumentPayload } from '../types/document'

export function useUpdateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDocumentPayload }) =>
      updateDocumentApi(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['document', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['documentActivity', variables.id] })
    },
  })
}

export function useShareDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { user_ids?: string[]; department_ids?: string[]; visibility?: string }
    }) => shareDocumentApi(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['documentActivity', variables.id] })
    },
  })
}
