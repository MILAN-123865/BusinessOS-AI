'use client'

import { CalendarEvent, EVENT_TYPE_CONFIG, EventType } from '@/types/calendar'
import { formatTime } from '@/lib/calendar-utils'
import { Clock, MapPin, Users } from 'lucide-react'

interface EventCardProps {
  event: CalendarEvent
  compact?: boolean
  onClick?: (event: CalendarEvent) => void
}

export function EventCard({ event, compact = false, onClick }: EventCardProps) {
  const config = EVENT_TYPE_CONFIG[event.event_type] ?? EVENT_TYPE_CONFIG.meeting
  const eventColor = event.color
    ? { backgroundColor: event.color + '30', borderColor: event.color + '80' }
    : {}

  if (compact) {
    return (
      <button
        onClick={() => onClick?.(event)}
        className={`w-full text-left rounded-md border px-1.5 py-0.5 text-xs font-medium truncate transition-all hover:opacity-90 ${config.bg} ${config.border} ${config.color}`}
        style={eventColor}
        title={event.title}
      >
        {!event.all_day && (
          <span className="opacity-70 mr-1">{formatTime(event.start)}</span>
        )}
        {event.title}
      </button>
    )
  }

  return (
    <button
      onClick={() => onClick?.(event)}
      className={`w-full text-left rounded-xl border p-3 transition-all hover:opacity-90 hover:shadow-md ${config.bg} ${config.border}`}
      style={eventColor}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold truncate ${config.color}`}>{event.title}</p>
          {event.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{event.description}</p>
          )}
        </div>
        <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${config.bg} ${config.color} border ${config.border}`}>
          {config.label}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {!event.all_day && (
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatTime(event.start)} – {formatTime(event.end)}
          </span>
        )}
        {event.location && (
          <span className="flex items-center gap-1 truncate max-w-[160px]">
            <MapPin size={11} />
            {event.location}
          </span>
        )}
        {event.attendees && event.attendees.length > 0 && (
          <span className="flex items-center gap-1">
            <Users size={11} />
            {event.attendees.length}
          </span>
        )}
        {event.all_day && (
          <span className="rounded-sm bg-primary/20 px-1 py-0.5 text-[10px] font-semibold text-accent">
            All Day
          </span>
        )}
      </div>
    </button>
  )
}
