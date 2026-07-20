import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { globalSearchApi, getRecentSearchesApi, clearRecentSearchesApi } from '../api/search'
import { SearchEntityType } from '../types/search'

export const useGlobalSearch = (query: string, filters?: { type?: SearchEntityType[] }) => {
  return useQuery({
    queryKey: ['global-search', query, filters],
    queryFn: () => globalSearchApi(query, filters),
    enabled: query.length >= 2, // Only search when query is at least 2 chars
    staleTime: 30000,
  })
}

export const useRecentSearches = () => {
  return useQuery({
    queryKey: ['recent-searches'],
    queryFn: getRecentSearchesApi,
  })
}

export const useClearRecentSearches = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: clearRecentSearchesApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-searches'] })
    }
  })
}
