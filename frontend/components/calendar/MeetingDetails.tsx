'use client'

import { Meeting, MEETING_STATUS_CONFIG, MEETING_TYPE_CONFIG } from '@/types/meeting'
import { formatDateTime, formatDuration } from '@/lib/calendar-utils'
import { Clock, MapPin, Video, User, FileText, CheckCircle2, ChevronRight } from 'lucide-react'

interface MeetingDetailsProps {
  meeting: Meeting
  onEdit?: (meeting: Meeting) => void
  onDelete?: (meeting: Meeting) => void
}

export function MeetingDetails({ meeting, onEdit, onDelete }: MeetingDetailsProps) {
  const statusConfig = MEETING_STATUS_CONFIG[meeting.status] ?? MEETING_STATUS_CONFIG.scheduled
  const typeConfig = MEETING_TYPE_CONFIG[meeting.meeting_type] ?? MEETING_TYPE_CONFIG.online

  return (
    <div className="space-y-6">
      {/* Top Banner Details */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/20 pb-4">
        <div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusConfig.bg} ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          <h2 className="text-2xl font-extrabold text-foreground mt-2">{meeting.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(meeting)}
              className="rounded-xl border border-border/40 bg-card/40 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
            >
              Edit Details
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(meeting)}
              className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Info Blocks */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Date, Time, Room, Link */}
        <div className="rounded-2xl border border-border/40 bg-card/30 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Schedule Context
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock size={16} className="text-accent mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {formatDateTime(meeting.start_time)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ends {formatDateTime(meeting.end_time)} ({formatDuration(meeting.start_time, meeting.end_time)})
                </p>
              </div>
            </div>

            {meeting.meeting_link && (
              <div className="flex items-start gap-3 pt-1">
                <Video size={16} className="text-accent mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Meeting Link</p>
                  <a
                    href={meeting.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    <span>{meeting.meeting_link}</span>
                    <ChevronRight size={14} />
                  </a>
                </div>
              </div>
            )}

            {meeting.room && (
              <div className="flex items-start gap-3 pt-1">
                <MapPin size={16} className="text-accent mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Physical Room</p>
                  <p className="text-sm text-foreground mt-0.5">{meeting.room}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 pt-1">
              <User size={16} className="text-accent mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Host</p>
                <p className="text-sm text-foreground mt-0.5">
                  {meeting.host ? `${meeting.host.first_name} ${meeting.host.last_name}` : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Agenda Card */}
        <div className="rounded-2xl border border-border/40 bg-card/30 p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText size={14} className="text-accent" />
            Agenda & Targets
          </h3>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {meeting.agenda || 'No formal meeting agenda specified.'}
          </p>
          {meeting.description && (
            <div className="pt-2 border-t border-border/20">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Details</p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {meeting.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
