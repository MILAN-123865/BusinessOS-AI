import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteDocumentApi } from '../api/document'

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDocumentApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['folders'] })
    },
  })
}
