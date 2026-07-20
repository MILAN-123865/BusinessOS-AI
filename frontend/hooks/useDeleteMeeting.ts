import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteMeetingApi } from '../api/meeting'

export function useDeleteMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteMeetingApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
    },
  })
}
