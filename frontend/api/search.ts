import { api } from '../services/axios'
import { SearchResponse, RecentSearch, SearchEntityType } from '../types/search'

export const globalSearchApi = async (query: string, filters?: { type?: SearchEntityType[] }): Promise<SearchResponse> => {
  const response = await api.get<{ success: boolean; data: SearchResponse }>('/search', {
    params: { q: query, types: filters?.type?.join(',') }
  })
  return response.data.data
}

export const getRecentSearchesApi = async (): Promise<RecentSearch[]> => {
  const response = await api.get<{ success: boolean; data: RecentSearch[] }>('/search/recent')
  return response.data.data
}

export const clearRecentSearchesApi = async (): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>('/search/recent')
  return response.data
}
