import { api } from '../services/axios'
import { CalendarEvent, CreateCalendarEventPayload, UpdateCalendarEventPayload } from '../types/calendar'

// ─────────────────────────────────────────────
// Calendar Events API
// ─────────────────────────────────────────────

export interface CalendarEventsParams {
  start?: string
  end?: string
  event_type?: string
  project_id?: string
  search?: string
}

export const getCalendarEventsApi = async (params?: CalendarEventsParams): Promise<CalendarEvent[]> => {
  const response = await api.get<{ success: boolean; data: CalendarEvent[] }>('/calendar/events', {
    params,
  })
  return response.data.data
}

export const getCalendarEventApi = async (id: string): Promise<CalendarEvent> => {
  const response = await api.get<{ success: boolean; data: CalendarEvent }>(`/calendar/events/${id}`)
  return response.data.data
}

export const createCalendarEventApi = async (
  payload: CreateCalendarEventPayload
): Promise<CalendarEvent> => {
  const response = await api.post<{ success: boolean; data: CalendarEvent }>('/calendar/events', payload)
  return response.data.data
}

export const updateCalendarEventApi = async (
  id: string,
  payload: UpdateCalendarEventPayload
): Promise<CalendarEvent> => {
  const response = await api.patch<{ success: boolean; data: CalendarEvent }>(
    `/calendar/events/${id}`,
    payload
  )
  return response.data.data
}

export const deleteCalendarEventApi = async (id: string): Promise<CalendarEvent> => {
  const response = await api.delete<{ success: boolean; data: CalendarEvent }>(`/calendar/events/${id}`)
  return response.data.data
}
