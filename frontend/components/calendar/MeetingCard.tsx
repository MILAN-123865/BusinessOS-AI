'use client'

import { Meeting, MEETING_STATUS_CONFIG, MEETING_TYPE_CONFIG } from '@/types/meeting'
import { Calendar, Clock, Video, MapPin, Users, ArrowUpRight } from 'lucide-react'
import { formatDateTime } from '@/lib/calendar-utils'
import Link from 'next/link'

interface MeetingCardProps {
  meeting: Meeting
  onSelect?: (meeting: Meeting) => void
}

export function MeetingCard({ meeting, onSelect }: MeetingCardProps) {
  const statusConfig = MEETING_STATUS_CONFIG[meeting.status] ?? MEETING_STATUS_CONFIG.scheduled
  const typeConfig = MEETING_TYPE_CONFIG[meeting.meeting_type] ?? MEETING_TYPE_CONFIG.online

  return (
    <div
      onClick={() => onSelect?.(meeting)}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/40 bg-card/30 p-5 backdrop-blur-md cursor-pointer transition-all hover:bg-card/50 hover:shadow-lg hover:border-accent/30"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors truncate">
              {meeting.title}
            </h3>
            {meeting.agenda && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{meeting.agenda}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusConfig.bg} ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Date Time */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={14} className="text-accent" />
          <span>
            {formatDateTime(meeting.start_time)} – {formatDateTime(meeting.end_time)}
          </span>
        </div>

        {/* Meeting Type & Info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs pt-1">
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-bold uppercase text-[9px] ${typeConfig.bg} ${typeConfig.color}`}>
            {typeConfig.label}
          </span>
          {meeting.meeting_link && (
            <a
              href={meeting.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-blue-400 hover:underline"
            >
              <Video size={13} />
              <span>Join Link</span>
            </a>
          )}
          {meeting.room && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin size={13} />
              <span>Room: {meeting.room}</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users size={14} />
          <span>{meeting.participants?.length ?? 0} participant(s)</span>
        </div>

        {meeting.project && (
          <span className="rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-accent max-w-[120px] truncate">
            {meeting.project.name}
          </span>
        )}
      </div>
    </div>
  )
}
