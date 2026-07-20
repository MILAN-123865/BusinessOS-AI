import { api } from '../services/axios'
import {
  Meeting,
  MeetingNote,
  CreateMeetingPayload,
  UpdateMeetingPayload,
} from '../types/meeting'

// ─────────────────────────────────────────────
// Meetings API
// ─────────────────────────────────────────────

export interface MeetingsParams {
  status?: string
  meeting_type?: string
  project_id?: string
  search?: string
  start_after?: string
  end_before?: string
}

export const getMeetingsApi = async (params?: MeetingsParams): Promise<Meeting[]> => {
  const response = await api.get<{ success: boolean; data: Meeting[] }>('/meetings', { params })
  return response.data.data
}

export const getMeetingApi = async (id: string): Promise<Meeting> => {
  const response = await api.get<{ success: boolean; data: Meeting }>(`/meetings/${id}`)
  return response.data.data
}

export const createMeetingApi = async (payload: CreateMeetingPayload): Promise<Meeting> => {
  const response = await api.post<{ success: boolean; data: Meeting }>('/meetings', payload)
  return response.data.data
}

export const updateMeetingApi = async (id: string, payload: UpdateMeetingPayload): Promise<Meeting> => {
  const response = await api.patch<{ success: boolean; data: Meeting }>(`/meetings/${id}`, payload)
  return response.data.data
}

export const deleteMeetingApi = async (id: string): Promise<Meeting> => {
  const response = await api.delete<{ success: boolean; data: Meeting }>(`/meetings/${id}`)
  return response.data.data
}

// ─────────────────────────────────────────────
// Meeting Notes API
// ─────────────────────────────────────────────

export const getMeetingNotesApi = async (meetingId: string): Promise<MeetingNote[]> => {
  const response = await api.get<{ success: boolean; data: MeetingNote[] }>(
    `/meetings/${meetingId}/notes`
  )
  return response.data.data
}

export const createMeetingNoteApi = async (
  meetingId: string,
  content: string
): Promise<MeetingNote> => {
  const response = await api.post<{ success: boolean; data: MeetingNote }>(
    `/meetings/${meetingId}/notes`,
    { content }
  )
  return response.data.data
}

export const updateMeetingNoteApi = async (
  meetingId: string,
  noteId: string,
  content: string
): Promise<MeetingNote> => {
  const response = await api.patch<{ success: boolean; data: MeetingNote }>(
    `/meetings/${meetingId}/notes/${noteId}`,
    { content }
  )
  return response.data.data
}

export const deleteMeetingNoteApi = async (meetingId: string, noteId: string): Promise<MeetingNote> => {
  const response = await api.delete<{ success: boolean; data: MeetingNote }>(
    `/meetings/${meetingId}/notes/${noteId}`
  )
  return response.data.data
}
