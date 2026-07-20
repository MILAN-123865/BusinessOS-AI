import { useQuery } from '@tanstack/react-query'
import { getMeetingApi } from '../api/meeting'

export function useMeeting(id: string) {
  return useQuery({
    queryKey: ['meeting', id],
    queryFn: () => getMeetingApi(id),
    enabled: !!id,
  })
}
