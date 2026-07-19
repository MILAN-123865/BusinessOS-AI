import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDocumentVersionsApi, uploadDocumentVersionApi } from '../api/document'

export function useDocumentVersions(documentId: string) {
  return useQuery({
    queryKey: ['documentVersions', documentId],
    queryFn: () => getDocumentVersionsApi(documentId),
    enabled: !!documentId,
  })
}

export function useUploadDocumentVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentId,
      file,
      onUploadProgress,
    }: {
      documentId: string
      file: File
      onUploadProgress?: (progressEvent: any) => void
    }) => uploadDocumentVersionApi(documentId, file, onUploadProgress),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['document', variables.documentId] })
      queryClient.invalidateQueries({ queryKey: ['documentVersions', variables.documentId] })
      queryClient.invalidateQueries({ queryKey: ['documentActivity', variables.documentId] })
    },
  })
}
