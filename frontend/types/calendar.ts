import { User } from './auth'
import { Project } from './project'
import { Task } from './task'

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export type EventType =
  | 'meeting'
  | 'task'
  | 'deadline'
  | 'reminder'
  | 'leave'
  | 'holiday'
  | 'company_event'
  | 'birthday'

export type CalendarView = 'month' | 'week' | 'day' | 'agenda'

export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'

// ─────────────────────────────────────────────
// Recurrence Rule
// ─────────────────────────────────────────────

export interface RecurrenceRule {
  frequency: RecurrenceFrequency
  interval?: number
  end_date?: string
  count?: number
  days_of_week?: number[] // 0=Sun, 1=Mon, …
}

// ─────────────────────────────────────────────
// Calendar Event
// ─────────────────────────────────────────────

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  event_type: EventType
  project_id?: string
  task_id?: string
  meeting_id?: string
  start: string          // ISO datetime string
  end: string            // ISO datetime string
  all_day: boolean
  color?: string
  location?: string
  participants?: string[] // user ids
  recurrence?: RecurrenceRule
  is_recurring?: boolean
  parent_event_id?: string
  created_by?: string
  created_at?: string
  updated_at?: string
  // Expanded relations
  project?: Project
  task?: Task
  creator?: User
  attendees?: User[]
}

// ─────────────────────────────────────────────
// Create / Update Payloads
// ─────────────────────────────────────────────

export interface CreateCalendarEventPayload {
  title: string
  description?: string
  event_type: EventType
  project_id?: string
  task_id?: string
  meeting_id?: string
  start: string
  end: string
  all_day?: boolean
  color?: string
  location?: string
  participants?: string[]
  recurrence?: RecurrenceRule
}

export type UpdateCalendarEventPayload = Partial<CreateCalendarEventPayload>

// ─────────────────────────────────────────────
// Calendar Filter State
// ─────────────────────────────────────────────

export interface CalendarFilters {
  event_types: EventType[]
  project_ids: string[]
  employee_ids: string[]
  department_ids: string[]
  search: string
}

// ─────────────────────────────────────────────
// UI Helpers
// ─────────────────────────────────────────────

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  events: CalendarEvent[]
}

export const EVENT_TYPE_CONFIG: Record<
  EventType,
  { label: string; color: string; bg: string; border: string }
> = {
  meeting: {
    label: 'Meeting',
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/40',
  },
  task: {
    label: 'Task',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/40',
  },
  deadline: {
    label: 'Deadline',
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/40',
  },
  reminder: {
    label: 'Reminder',
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/40',
  },
  leave: {
    label: 'Leave',
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/40',
  },
  holiday: {
    label: 'Holiday',
    color: 'text-pink-400',
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/40',
  },
  company_event: {
    label: 'Company Event',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/40',
  },
  birthday: {
    label: 'Birthday',
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/40',
  },
}
