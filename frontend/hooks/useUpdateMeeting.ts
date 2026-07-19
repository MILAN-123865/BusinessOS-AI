import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateMeetingApi } from '../api/meeting'
import { UpdateMeetingPayload } from '../types/meeting'

export function useUpdateMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMeetingPayload }) =>
      updateMeetingApi(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
      queryClient.invalidateQueries({ queryKey: ['meeting', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
    },
  })
}
