import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadDocumentApi } from '../api/document'
import { CreateDocumentPayload } from '../types/document'

interface UploadParams {
  file: File
  metadata?: CreateDocumentPayload
  onUploadProgress?: (progressEvent: any) => void
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, metadata, onUploadProgress }: UploadParams) =>
      uploadDocumentApi(file, metadata, onUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['folders'] })
    },
  })
}
