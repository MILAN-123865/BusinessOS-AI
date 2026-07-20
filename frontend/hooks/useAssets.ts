import { useQuery } from '@tanstack/react-query'
import { getAssets } from '../api/asset'

export function useAssets(params?: any) {
  return useQuery({
    queryKey: ['assets', params],
    queryFn: () => getAssets(params),
  })
}
