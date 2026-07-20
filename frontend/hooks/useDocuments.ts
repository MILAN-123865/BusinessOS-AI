import { useQuery } from '@tanstack/react-query'
import { getDocumentsApi, GetDocumentsParams } from '../api/document'

export function useDocuments(params?: GetDocumentsParams) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => getDocumentsApi(params),
  })
}
