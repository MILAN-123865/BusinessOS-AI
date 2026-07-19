'use client'

import { CalendarEvent } from '@/types/calendar'
import { EventCard } from './EventCard'
import {
  buildWeekDays,
  startOfWeek,
  getEventsForDay,
  isToday,
  isSameDay,
  buildHourSlots,
  formatTime,
} from '@/lib/calendar-utils'

interface CalendarWeekProps {
  currentDate: Date
  events: CalendarEvent[]
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  onSelectEvent: (event: CalendarEvent) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function getEventTopOffset(start: string): number {
  const d = new Date(start)
  return (d.getHours() + d.getMinutes() / 60) * 64
}

function getEventHeight(start: string, end: string): number {
  const startD = new Date(start)
  const endD = new Date(end)
  const durationHours = (endD.getTime() - startD.getTime()) / 3600000
  return Math.max(durationHours * 64, 24)
}

export function CalendarWeek({
  currentDate,
  events,
  selectedDate,
  onSelectDate,
  onSelectEvent,
}: CalendarWeekProps) {
  const weekStart = startOfWeek(currentDate)
  const weekDays = buildWeekDays(weekStart)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day headers */}
      <div className="grid border-b border-border/40" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
        <div className="border-r border-border/40" />
        {weekDays.map((day) => {
          const today = isToday(day)
          const selected = selectedDate ? isSameDay(day, selectedDate) : false
          const dayEvents = getEventsForDay(events, day)
          const allDayEvents = dayEvents.filter((e) => e.all_day)
          return (
            <div
              key={day.toISOString()}
              className={`border-r border-border/40 cursor-pointer hover:bg-card/20 transition-colors ${selected ? 'bg-primary/10' : ''}`}
              onClick={() => onSelectDate(day)}
            >
              <div className="flex flex-col items-center py-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span
                  className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    today ? 'bg-accent text-accent-foreground' : 'text-foreground'
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
              {/* All-day events */}
              {allDayEvents.length > 0 && (
                <div className="pb-1 px-1 flex flex-col gap-0.5">
                  {allDayEvents.map((e) => (
                    <EventCard key={e.id} event={e} compact onClick={onSelectEvent} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
          <div className="grid" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
            {/* Hour labels column */}
            <div className="border-r border-border/40">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="flex items-start justify-end border-b border-border/20 pr-2 pt-0.5"
                  style={{ height: 64 }}
                >
                  <span className="text-[10px] text-muted-foreground leading-none">
                    {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const dayEvents = getEventsForDay(events, day).filter((e) => !e.all_day)
              return (
                <div
                  key={day.toISOString()}
                  className="relative border-r border-border/40"
                  style={{ height: 64 * 24 }}
                >
                  {/* Hour lines */}
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 border-b border-border/20"
                      style={{ top: h * 64 }}
                    />
                  ))}

                  {/* Events */}
                  {dayEvents.map((event) => {
                    const top = getEventTopOffset(event.start)
                    const height = getEventHeight(event.start, event.end)
                    const config = { bg: 'bg-blue-500/20', color: 'text-blue-400', border: 'border-blue-500/40' }
                    return (
                      <button
                        key={event.id}
                        onClick={() => onSelectEvent(event)}
                        className="absolute left-1 right-1 rounded-md border border-blue-500/30 bg-blue-500/20 px-1.5 py-0.5 text-left text-blue-400 overflow-hidden hover:opacity-90 transition-all shadow-sm"
                        style={{
                          top,
                          height: Math.max(height, 24),
                          ...(event.color ? { backgroundColor: event.color + '30', borderColor: event.color + '60', color: event.color } : {}),
                        }}
                      >
                        <p className="text-[10px] font-bold leading-tight truncate">{event.title}</p>
                        {height > 32 && (
                          <p className="text-[10px] opacity-70">{formatTime(event.start)}</p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
