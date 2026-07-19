import { useQuery } from '@tanstack/react-query'
import { getCalendarEventsApi, CalendarEventsParams } from '../api/calendar'

export function useEvents(params?: CalendarEventsParams) {
  return useQuery({
    queryKey: ['calendarEvents', params],
    queryFn: () => getCalendarEventsApi(params),
  })
}
