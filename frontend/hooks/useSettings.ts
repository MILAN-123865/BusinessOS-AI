import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSystemSettingsApi, updateSystemSettingsApi } from '../api/settings'
import { SystemSettings } from '../types/settings'

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: getSystemSettingsApi,
    staleTime: 300000, // 5 minutes
  })
}

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<SystemSettings>) => updateSystemSettingsApi(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['system-settings'], data)
    }
  })
}
