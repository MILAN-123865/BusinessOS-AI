import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDocumentsApi,
  GetDocumentsParams,
  createDocumentApi,
  deleteDocumentApi,
  uploadDocumentApi
} from '../api/document'
import { CreateDocumentPayload } from '../types/document'

export function useDocuments(params?: GetDocumentsParams) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => getDocumentsApi(params),
  })
}

export function useCreateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDocumentPayload) => createDocumentApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    }
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata?: CreateDocumentPayload }) =>
      uploadDocumentApi(file, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    }
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDocumentApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    }
  })
}
