import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCalendarEventsApi,
  getCalendarEventApi,
  createCalendarEventApi,
  updateCalendarEventApi,
  deleteCalendarEventApi,
  CalendarEventsParams,
} from '../api/calendar'
import { CreateCalendarEventPayload, UpdateCalendarEventPayload } from '../types/calendar'

// ─────────────────────────────────────────────
// useCalendarEvents
// ─────────────────────────────────────────────

export function useCalendarEvents(params?: CalendarEventsParams) {
  return useQuery({
    queryKey: ['calendarEvents', params],
    queryFn: () => getCalendarEventsApi(params),
  })
}

// ─────────────────────────────────────────────
// useCalendarEvent (single)
// ─────────────────────────────────────────────

export function useCalendarEvent(id: string) {
  return useQuery({
    queryKey: ['calendarEvent', id],
    queryFn: () => getCalendarEventApi(id),
    enabled: !!id,
  })
}

// ─────────────────────────────────────────────
// useCreateCalendarEvent
// ─────────────────────────────────────────────

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCalendarEventPayload) => createCalendarEventApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
    },
  })
}

// ─────────────────────────────────────────────
// useUpdateCalendarEvent
// ─────────────────────────────────────────────

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCalendarEventPayload }) =>
      updateCalendarEventApi(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
      queryClient.invalidateQueries({ queryKey: ['calendarEvent', variables.id] })
    },
  })
}

// ─────────────────────────────────────────────
// useDeleteCalendarEvent
// ─────────────────────────────────────────────

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCalendarEventApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
    },
  })
}
