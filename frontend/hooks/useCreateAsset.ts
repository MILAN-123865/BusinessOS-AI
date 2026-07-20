import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAsset } from '../api/asset'
import { Asset } from '../types/asset'

export function useCreateAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<Asset>) => createAsset(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}
