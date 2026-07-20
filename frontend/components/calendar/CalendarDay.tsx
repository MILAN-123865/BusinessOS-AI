'use client'

import { CalendarEvent } from '@/types/calendar'
import { EventCard } from './EventCard'
import { getEventsForDay, isToday, formatTime } from '@/lib/calendar-utils'

interface CalendarDayProps {
  currentDate: Date
  events: CalendarEvent[]
  onSelectEvent: (event: CalendarEvent) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function getEventTopOffset(start: string): number {
  const d = new Date(start)
  return (d.getHours() + d.getMinutes() / 60) * 80
}

function getEventHeight(start: string, end: string): number {
  const startD = new Date(start)
  const endD = new Date(end)
  const durationHours = (endD.getTime() - startD.getTime()) / 3600000
  return Math.max(durationHours * 80, 32)
}

export function CalendarDay({ currentDate, events, onSelectEvent }: CalendarDayProps) {
  const dayEvents = getEventsForDay(events, currentDate)
  const allDayEvents = dayEvents.filter((e) => e.all_day)
  const timedEvents = dayEvents.filter((e) => !e.all_day)
  const today = isToday(currentDate)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day header */}
      <div className="flex items-center gap-4 border-b border-border/40 bg-card/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold ${
              today ? 'bg-accent text-accent-foreground' : 'bg-primary/20 text-foreground'
            }`}
          >
            {currentDate.getDate()}
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        {today && (
          <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent">
            Today
          </span>
        )}
        <div className="ml-auto text-sm text-muted-foreground">
          {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="border-b border-border/40 bg-card/10 px-6 py-2 flex gap-2 flex-wrap">
          {allDayEvents.map((event) => (
            <EventCard key={event.id} event={event} compact onClick={onSelectEvent} />
          ))}
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative flex" style={{ height: 80 * 24 }}>
          {/* Hour labels */}
          <div className="w-16 shrink-0 border-r border-border/40">
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex items-start justify-end border-b border-border/20 pr-3 pt-1"
                style={{ height: 80 }}
              >
                <span className="text-[11px] font-medium text-muted-foreground">
                  {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Events area */}
          <div className="relative flex-1">
            {/* Hour lines */}
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-b border-border/20"
                style={{ top: h * 80 }}
              />
            ))}

            {/* Current time indicator */}
            {today && (() => {
              const now = new Date()
              const top = (now.getHours() + now.getMinutes() / 60) * 80
              return (
                <div
                  className="absolute left-0 right-0 z-10 flex items-center gap-2"
                  style={{ top }}
                >
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <div className="flex-1 h-px bg-accent" />
                </div>
              )
            })()}

            {/* Events */}
            {timedEvents.map((event) => {
              const top = getEventTopOffset(event.start)
              const height = getEventHeight(event.start, event.end)
              return (
                <button
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className="absolute left-2 right-2 rounded-xl border border-blue-500/30 bg-blue-500/20 px-3 py-2 text-left text-blue-400 overflow-hidden hover:opacity-90 transition-all shadow-sm hover:shadow-md"
                  style={{
                    top,
                    height,
                    ...(event.color
                      ? { backgroundColor: event.color + '25', borderColor: event.color + '50', color: event.color }
                      : {}),
                  }}
                >
                  <p className="text-sm font-bold truncate">{event.title}</p>
                  {height > 40 && (
                    <p className="text-xs opacity-70 mt-0.5">
                      {formatTime(event.start)} – {formatTime(event.end)}
                    </p>
                  )}
                  {height > 64 && event.location && (
                    <p className="text-xs opacity-60 mt-0.5 truncate">📍 {event.location}</p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
