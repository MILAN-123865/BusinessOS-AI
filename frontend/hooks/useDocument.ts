import { useQuery } from '@tanstack/react-query'
import { getDocumentApi, getDocumentActivityApi } from '../api/document'

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => getDocumentApi(id),
    enabled: !!id,
  })
}

export function useDocumentActivity(id: string) {
  return useQuery({
    queryKey: ['documentActivity', id],
    queryFn: () => getDocumentActivityApi(id),
    enabled: !!id,
  })
}
