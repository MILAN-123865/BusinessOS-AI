import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMeetingApi } from '../api/meeting'
import { CreateMeetingPayload } from '../types/meeting'

export function useCreateMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateMeetingPayload) => createMeetingApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
    },
  })
}
