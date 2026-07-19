import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAssetMaintenance, createMaintenance, updateMaintenance, deleteMaintenance } from '../api/asset'
import { MaintenanceRecord } from '../types/asset'

export function useAssetMaintenance(assetId: string) {
  return useQuery({
    queryKey: ['assetMaintenance', assetId],
    queryFn: () => getAssetMaintenance(assetId),
    enabled: !!assetId,
  })
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assetId, payload }: { assetId: string; payload: Partial<MaintenanceRecord> }) => createMaintenance(assetId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assetMaintenance', variables.assetId] })
      queryClient.invalidateQueries({ queryKey: ['asset', variables.assetId] })
    },
  })
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assetId, maintenanceId, payload }: { assetId: string; maintenanceId: string; payload: Partial<MaintenanceRecord> }) => updateMaintenance(assetId, maintenanceId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assetMaintenance', variables.assetId] })
    },
  })
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ assetId, maintenanceId }: { assetId: string; maintenanceId: string }) => deleteMaintenance(assetId, maintenanceId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assetMaintenance', variables.assetId] })
    },
  })
}
