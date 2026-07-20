import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMeetingsApi,
  getMeetingApi,
  createMeetingApi,
  updateMeetingApi,
  deleteMeetingApi,
  getMeetingNotesApi,
  createMeetingNoteApi,
  updateMeetingNoteApi,
  deleteMeetingNoteApi,
  MeetingsParams,
} from '../api/meeting'
import { CreateMeetingPayload, UpdateMeetingPayload } from '../types/meeting'

// ─────────────────────────────────────────────
// useMeetings
// ─────────────────────────────────────────────

export function useMeetings(params?: MeetingsParams) {
  return useQuery({
    queryKey: ['meetings', params],
    queryFn: () => getMeetingsApi(params),
  })
}

// ─────────────────────────────────────────────
// useMeeting (single)
// ─────────────────────────────────────────────

export function useMeeting(id: string) {
  return useQuery({
    queryKey: ['meeting', id],
    queryFn: () => getMeetingApi(id),
    enabled: !!id,
  })
}

// ─────────────────────────────────────────────
// useCreateMeeting
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// useUpdateMeeting
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// useDeleteMeeting
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Meeting Notes
// ─────────────────────────────────────────────

export function useMeetingNotes(meetingId: string) {
  return useQuery({
    queryKey: ['meetingNotes', meetingId],
    queryFn: () => getMeetingNotesApi(meetingId),
    enabled: !!meetingId,
  })
}

export function useCreateMeetingNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ meetingId, content }: { meetingId: string; content: string }) =>
      createMeetingNoteApi(meetingId, content),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetingNotes', variables.meetingId] })
      queryClient.invalidateQueries({ queryKey: ['meeting', variables.meetingId] })
    },
  })
}

export function useUpdateMeetingNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      meetingId,
      noteId,
      content,
    }: {
      meetingId: string
      noteId: string
      content: string
    }) => updateMeetingNoteApi(meetingId, noteId, content),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetingNotes', variables.meetingId] })
    },
  })
}

export function useDeleteMeetingNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ meetingId, noteId }: { meetingId: string; noteId: string }) =>
      deleteMeetingNoteApi(meetingId, noteId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetingNotes', variables.meetingId] })
      queryClient.invalidateQueries({ queryKey: ['meeting', variables.meetingId] })
    },
  })
}
