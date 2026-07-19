import { useQuery } from '@tanstack/react-query'
import { getAssetHistory } from '../api/asset'

export function useAssetHistory(id: string) {
  return useQuery({
    queryKey: ['assetHistory', id],
    queryFn: () => getAssetHistory(id),
    enabled: !!id,
  })
}
