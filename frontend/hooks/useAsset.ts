import { useQuery } from '@tanstack/react-query'
import { getAsset } from '../api/asset'

export function useAsset(id: string) {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: () => getAsset(id),
    enabled: !!id,
  })
}
