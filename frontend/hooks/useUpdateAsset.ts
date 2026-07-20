import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateAsset } from '../api/asset'
import { Asset } from '../types/asset'

export function useUpdateAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Asset> }) => updateAsset(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['asset', variables.id] })
    },
  })
}
