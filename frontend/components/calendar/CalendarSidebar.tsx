'use client'

import { useState } from 'react'
import { CalendarEvent, EVENT_TYPE_CONFIG } from '@/types/calendar'
import {
  buildMonthGrid,
  isToday,
  isSameDay,
  addMonths,
  getEventsForDay,
  formatTime,
} from '@/lib/calendar-utils'
import { ChevronLeft, ChevronRight, Clock, Video, FileText, AlertTriangle } from 'lucide-react'

interface CalendarSidebarProps {
  currentDate: Date
  events: CalendarEvent[]
  onSelectDate: (date: Date) => void
  onSelectEvent: (event: CalendarEvent) => void
}

export function CalendarSidebar({
  currentDate,
  events,
  onSelectDate,
  onSelectEvent,
}: CalendarSidebarProps) {
  const [miniDate, setMiniDate] = useState(new Date(currentDate))

  const handlePrevMonth = () => setMiniDate(addMonths(miniDate, -1))
  const handleNextMonth = () => setMiniDate(addMonths(miniDate, 1))

  const year = miniDate.getFullYear()
  const month = miniDate.getMonth()
  const monthDays = buildMonthGrid(year, month)

  // Sub-lists
  const todayEvents = events.filter((e) => isToday(new Date(e.start)))
  const upcomingMeetings = events.filter(
    (e) => e.event_type === 'meeting' && new Date(e.start) > new Date()
  )
  const upcomingDeadlines = events.filter(
    (e) => e.event_type === 'deadline' && new Date(e.start) > new Date()
  )

  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="flex flex-col gap-6 w-full lg:w-72 shrink-0">
      {/* Mini Calendar Card */}
      <div className="rounded-2xl border border-border/40 bg-card/30 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-foreground">
            {miniDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <div className="flex gap-1">
            <button
              onClick={handlePrevMonth}
              className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-card/60"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-card/60"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 text-center mb-1.5">
          {DAY_LABELS.map((d, i) => (
            <span key={i} className="text-[10px] font-bold text-muted-foreground uppercase">
              {d}
            </span>
          ))}
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((day) => {
            const current = day.getMonth() === month
            const today = isToday(day)
            const active = isSameDay(day, currentDate)
            const dayEvents = getEventsForDay(events, day)
            const hasEvents = dayEvents.length > 0

            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  onSelectDate(day)
                  setMiniDate(new Date(day))
                }}
                className={`relative flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-all ${
                  today
                    ? 'bg-accent text-accent-foreground font-bold'
                    : active
                    ? 'bg-primary/20 text-accent font-semibold border border-accent/30'
                    : current
                    ? 'text-foreground hover:bg-card/60'
                    : 'text-muted-foreground/30 hover:bg-card/40'
                }`}
              >
                <span>{day.getDate()}</span>
                {hasEvents && !today && !active && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Today's Events List */}
      <div className="rounded-2xl border border-border/40 bg-card/30 p-4 backdrop-blur-md space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Today&apos;s Events ({todayEvents.length})
        </h3>
        <div className="space-y-2">
          {todayEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground">No events scheduled today.</p>
          ) : (
            todayEvents.slice(0, 4).map((e) => {
              const config = EVENT_TYPE_CONFIG[e.event_type] ?? EVENT_TYPE_CONFIG.meeting
              return (
                <div
                  key={e.id}
                  onClick={() => onSelectEvent(e)}
                  className="flex items-start gap-2.5 rounded-lg border border-border/20 bg-card/40 p-2 cursor-pointer hover:bg-card/60 transition-all"
                >
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${config.bg} border ${config.border}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{e.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {e.all_day ? 'All Day' : formatTime(e.start)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Upcoming Meetings List */}
      <div className="rounded-2xl border border-border/40 bg-card/30 p-4 backdrop-blur-md space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Upcoming Meetings ({upcomingMeetings.length})
        </h3>
        <div className="space-y-2">
          {upcomingMeetings.length === 0 ? (
            <p className="text-xs text-muted-foreground">No upcoming meetings.</p>
          ) : (
            upcomingMeetings.slice(0, 3).map((e) => (
              <div
                key={e.id}
                onClick={() => onSelectEvent(e)}
                className="flex items-start gap-2 rounded-lg border border-border/20 bg-card/40 p-2 cursor-pointer hover:bg-card/60 transition-all"
              >
                <div className="rounded-md bg-blue-500/10 p-1.5 text-blue-400">
                  <Video size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">{e.title}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    {new Date(e.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} @{' '}
                    {formatTime(e.start)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Deadlines List */}
      <div className="rounded-2xl border border-border/40 bg-card/30 p-4 backdrop-blur-md space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Upcoming Deadlines ({upcomingDeadlines.length})
        </h3>
        <div className="space-y-2">
          {upcomingDeadlines.length === 0 ? (
            <p className="text-xs text-muted-foreground">No upcoming project deadlines.</p>
          ) : (
            upcomingDeadlines.slice(0, 3).map((e) => (
              <div
                key={e.id}
                onClick={() => onSelectEvent(e)}
                className="flex items-start gap-2 rounded-lg border border-border/20 bg-card/40 p-2 cursor-pointer hover:bg-card/60 transition-all"
              >
                <div className="rounded-md bg-red-500/10 p-1.5 text-red-400">
                  <AlertTriangle size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">{e.title}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    Due{' '}
                    {new Date(e.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
