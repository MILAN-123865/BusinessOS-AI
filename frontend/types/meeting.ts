import { User } from './auth'
import { Project } from './project'

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export type MeetingType =
  | 'online'
  | 'offline'
  | 'hybrid'
  | 'client_meeting'
  | 'internal'
  | 'standup'
  | 'sprint_review'
  | 'retrospective'
  | 'planning'

export type MeetingStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'postponed'

export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'

// ─────────────────────────────────────────────
// Meeting Participant
// ─────────────────────────────────────────────

export interface MeetingParticipant {
  id: string
  meeting_id: string
  user_id: string
  role?: 'host' | 'participant' | 'observer'
  status?: 'accepted' | 'declined' | 'pending' | 'tentative'
  user?: User
}

// ─────────────────────────────────────────────
// Meeting Note
// ─────────────────────────────────────────────

export interface MeetingNote {
  id: string
  meeting_id: string
  content: string
  created_by?: string
  created_at?: string
  updated_at?: string
  author?: User
}

// ─────────────────────────────────────────────
// Meeting Attachment
// ─────────────────────────────────────────────

export interface MeetingAttachment {
  id: string
  meeting_id: string
  file_name: string
  file_url: string
  file_size?: number
  file_type?: string
  uploaded_by?: string
  created_at?: string
}

// ─────────────────────────────────────────────
// Recurrence Rule
// ─────────────────────────────────────────────

export interface MeetingRecurrenceRule {
  frequency: RecurrenceFrequency
  interval?: number
  end_date?: string
  count?: number
  days_of_week?: number[]
}

// ─────────────────────────────────────────────
// Meeting
// ─────────────────────────────────────────────

export interface Meeting {
  id: string
  title: string
  agenda?: string
  description?: string
  meeting_type: MeetingType
  host_id?: string
  project_id?: string
  meeting_link?: string
  room?: string
  start_time: string     // ISO datetime
  end_time: string       // ISO datetime
  status: MeetingStatus
  is_recurring?: boolean
  recurrence?: MeetingRecurrenceRule
  parent_meeting_id?: string
  created_at?: string
  updated_at?: string
  // Expanded relations
  host?: User
  project?: Project
  participants: MeetingParticipant[]
  notes: MeetingNote[]
  attachments: MeetingAttachment[]
}

// ─────────────────────────────────────────────
// Create / Update Payloads
// ─────────────────────────────────────────────

export interface CreateMeetingPayload {
  title: string
  agenda?: string
  description?: string
  meeting_type: MeetingType
  host_id?: string
  project_id?: string
  meeting_link?: string
  room?: string
  start_time: string
  end_time: string
  status?: MeetingStatus
  participant_ids?: string[]
  is_recurring?: boolean
  recurrence?: MeetingRecurrenceRule
}

export type UpdateMeetingPayload = Partial<CreateMeetingPayload>

// ─────────────────────────────────────────────
// UI Config
// ─────────────────────────────────────────────

export const MEETING_TYPE_CONFIG: Record<
  MeetingType,
  { label: string; color: string; bg: string }
> = {
  online: { label: 'Online', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  offline: { label: 'Offline', color: 'text-slate-400', bg: 'bg-slate-500/20' },
  hybrid: { label: 'Hybrid', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  client_meeting: { label: 'Client', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  internal: { label: 'Internal', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  standup: { label: 'Standup', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  sprint_review: { label: 'Sprint Review', color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  retrospective: { label: 'Retrospective', color: 'text-pink-400', bg: 'bg-pink-500/20' },
  planning: { label: 'Planning', color: 'text-orange-400', bg: 'bg-orange-500/20' },
}

export const MEETING_STATUS_CONFIG: Record<
  MeetingStatus,
  { label: string; color: string; bg: string }
> = {
  scheduled: { label: 'Scheduled', color: 'text-blue-400', bg: 'bg-blue-500/15' },
  in_progress: { label: 'In Progress', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  completed: { label: 'Completed', color: 'text-slate-400', bg: 'bg-slate-500/15' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/15' },
  postponed: { label: 'Postponed', color: 'text-amber-400', bg: 'bg-amber-500/15' },
}
