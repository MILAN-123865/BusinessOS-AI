'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Meeting, MeetingType, MeetingStatus, MEETING_TYPE_CONFIG } from '@/types/meeting'
import { Project } from '@/types/project'
import { User } from '@/types/auth'
import { Loader2, Plus, Calendar, Clock, Link, MapPin, Tag } from 'lucide-react'

// Zod validation schema
const meetingSchema = z
  .object({
    title: z.string().min(1, 'Meeting title is required').max(200),
    agenda: z.string().max(1000).optional().or(z.literal('')),
    description: z.string().max(2000).optional().or(z.literal('')),
    meeting_type: z.enum([
      'online',
      'offline',
      'hybrid',
      'client_meeting',
      'internal',
      'standup',
      'sprint_review',
      'retrospective',
      'planning',
    ]),
    project_id: z.string().optional().or(z.literal('')),
    meeting_link: z.string().url('Must be a valid web link').optional().or(z.literal('')),
    room: z.string().max(100).optional().or(z.literal('')),
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().min(1, 'End time is required'),
    status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed']),
    participant_ids: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_time).getTime()
      const end = new Date(data.end_time).getTime()
      return end > start
    },
    {
      message: 'End time must be strictly after the start time',
      path: ['end_time'],
    }
  )

type MeetingFormValues = z.infer<typeof meetingSchema>

interface MeetingFormProps {
  initialValues?: Partial<Meeting>
  projects?: Project[]
  employees?: User[]
  onSubmit: (values: CreateMeetingFormPayload) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export interface CreateMeetingFormPayload {
  title: string
  agenda?: string
  description?: string
  meeting_type: MeetingType
  project_id?: string
  meeting_link?: string
  room?: string
  start_time: string
  end_time: string
  status?: MeetingStatus
  participant_ids?: string[]
}

export function MeetingForm({
  initialValues,
  projects = [],
  employees = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}: MeetingFormProps) {
  // Pre-process dates for datetime-local input fields
  const getFormattedDate = (isoStr?: string) => {
    if (!isoStr) return ''
    const d = new Date(isoStr)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const defaultValues: Partial<MeetingFormValues> = {
    title: initialValues?.title ?? '',
    agenda: initialValues?.agenda ?? '',
    description: initialValues?.description ?? '',
    meeting_type: initialValues?.meeting_type ?? 'online',
    project_id: initialValues?.project_id ?? '',
    meeting_link: initialValues?.meeting_link ?? '',
    room: initialValues?.room ?? '',
    start_time: getFormattedDate(initialValues?.start_time),
    end_time: getFormattedDate(initialValues?.end_time),
    status: initialValues?.status ?? 'scheduled',
    participant_ids: initialValues?.participants?.map((p) => p.user_id) ?? [],
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema) as any,
    defaultValues,
  })

  const selectedParticipants = watch('participant_ids') || []

  const toggleParticipant = (userId: string) => {
    const isSelected = selectedParticipants.includes(userId)
    if (isSelected) {
      setValue(
        'participant_ids',
        selectedParticipants.filter((id) => id !== userId)
      )
    } else {
      setValue('participant_ids', [...selectedParticipants, userId])
    }
  }

  const handleFormSubmit = async (values: MeetingFormValues) => {
    // Convert inputs back to ISO strings
    const payload: CreateMeetingFormPayload = {
      ...values,
      start_time: new Date(values.start_time).toISOString(),
      end_time: new Date(values.end_time).toISOString(),
      project_id: values.project_id || undefined,
      meeting_link: values.meeting_link || undefined,
      room: values.room || undefined,
    }
    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase">Meeting Title</label>
        <input
          type="text"
          {...register('title')}
          placeholder="Product Alignment Sync"
          className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      {/* Agenda & Description */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Agenda</label>
          <textarea
            {...register('agenda')}
            rows={3}
            placeholder="Main topics and items to discuss..."
            className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          />
          {errors.agenda && <p className="text-xs text-destructive">{errors.agenda.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Context, materials, guidelines..."
            className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>
      </div>

      {/* Dates and Times */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
            <Clock size={12} />
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            {...register('start_time')}
            className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          />
          {errors.start_time && <p className="text-xs text-destructive">{errors.start_time.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
            <Clock size={12} />
            End Date & Time
          </label>
          <input
            type="datetime-local"
            {...register('end_time')}
            className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          />
          {errors.end_time && <p className="text-xs text-destructive">{errors.end_time.message}</p>}
        </div>
      </div>

      {/* Meeting configuration */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Type */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Meeting Type</label>
          <select
            {...register('meeting_type')}
            className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          >
            {(Object.keys(MEETING_TYPE_CONFIG) as MeetingType[]).map((t) => (
              <option key={t} value={t}>
                {MEETING_TYPE_CONFIG[t].label}
              </option>
            ))}
          </select>
          {errors.meeting_type && <p className="text-xs text-destructive">{errors.meeting_type.message}</p>}
        </div>

        {/* Project association */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Project</label>
          <select
            {...register('project_id')}
            className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="">None</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
          <select
            {...register('status')}
            className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="postponed">Postponed</option>
          </select>
          {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
        </div>
      </div>

      {/* Online/Offline Locations */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
            <Link size={12} />
            Meeting Link (Online)
          </label>
          <input
            type="text"
            {...register('meeting_link')}
            placeholder="https://meet.google.com/abc-xyz"
            className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          />
          {errors.meeting_link && <p className="text-xs text-destructive">{errors.meeting_link.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
            <MapPin size={12} />
            Room Name (Physical Location)
          </label>
          <input
            type="text"
            {...register('room')}
            placeholder="Conference Room Alpha"
            className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          />
          {errors.room && <p className="text-xs text-destructive">{errors.room.message}</p>}
        </div>
      </div>

      {/* Participant List (Selectors) */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase block">
          Participants ({selectedParticipants.length} selected)
        </label>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto rounded-xl border border-border/40 bg-card/25 p-3">
          {employees.map((emp) => {
            const active = selectedParticipants.includes(emp.id)
            return (
              <button
                key={emp.id}
                type="button"
                onClick={() => toggleParticipant(emp.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? 'bg-primary/20 border-accent/30 text-accent font-semibold'
                    : 'border-border/40 text-muted-foreground hover:bg-card/45 hover:text-foreground'
                }`}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/30 text-[9px] font-bold text-accent">
                  {emp.first_name?.[0]}{emp.last_name?.[0]}
                </div>
                <span>
                  {emp.first_name} {emp.last_name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border/40 px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex justify-center items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          <span>{initialValues ? 'Save Changes' : 'Schedule Meeting'}</span>
        </button>
      </div>
    </form>
  )
}
