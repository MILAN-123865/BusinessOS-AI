'use client'

import { motion } from 'framer-motion'
import { CalendarEvent, EVENT_TYPE_CONFIG } from '@/types/calendar'
import { formatShortDate, formatTime, sortEventsByTime } from '@/lib/calendar-utils'
import { Clock, MapPin, Tag } from 'lucide-react'

interface CalendarAgendaProps {
  currentDate: Date
  events: CalendarEvent[]
  onSelectEvent: (event: CalendarEvent) => void
}

export function CalendarAgenda({ currentDate, events, onSelectEvent }: CalendarAgendaProps) {
  // Sort events by starting time
  const sortedEvents = sortEventsByTime(events)

  // Group events by day
  const groupedEvents: Record<string, CalendarEvent[]> = {}
  sortedEvents.forEach((event) => {
    const dateStr = new Date(event.start).toDateString()
    if (!groupedEvents[dateStr]) {
      groupedEvents[dateStr] = []
    }
    groupedEvents[dateStr].push(event)
  })

  const groupKeys = Object.keys(groupedEvents)

  return (
    <div className="flex flex-col h-full bg-card/10 overflow-y-auto p-6 space-y-6">
      {groupKeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Clock size={36} className="opacity-40 mb-2" />
          <p className="text-sm font-semibold">No upcoming events or meetings scheduled.</p>
        </div>
      ) : (
        groupKeys.map((key, groupIdx) => {
          const date = new Date(key)
          const isToday = new Date().toDateString() === key
          const dayEvents = groupedEvents[key]

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIdx * 0.05 }}
              className="space-y-3"
            >
              {/* Day Header */}
              <div className="flex items-center gap-3 sticky top-0 bg-background/90 py-1.5 px-3 rounded-lg backdrop-blur-md border border-border/40 z-10">
                <span className="text-sm font-bold text-foreground">
                  {formatShortDate(date)}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {date.toLocaleDateString('en-US', { weekday: 'long' })}
                </span>
                {isToday && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">
                    Today
                  </span>
                )}
              </div>

              {/* Day Events Grid */}
              <div className="grid gap-3 pl-3">
                {dayEvents.map((event) => {
                  const config = EVENT_TYPE_CONFIG[event.event_type] ?? EVENT_TYPE_CONFIG.meeting
                  const eventColor = event.color
                    ? { backgroundColor: event.color + '20', borderColor: event.color + '50' }
                    : {}

                  return (
                    <div
                      key={event.id}
                      onClick={() => onSelectEvent(event)}
                      className={`flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/30 p-4 cursor-pointer hover:bg-card/50 transition-all hover:shadow-md`}
                      style={eventColor}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: event.color ?? '#3B82F6' }} />
                        <div>
                          <h4 className="text-sm font-bold text-foreground hover:text-accent transition-colors">
                            {event.title}
                          </h4>
                          {event.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-xl line-clamp-1">
                              {event.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock size={12} />
                              {event.all_day ? (
                                'All Day'
                              ) : (
                                <>
                                  {formatTime(event.start)} – {formatTime(event.end)}
                                </>
                              )}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                                <MapPin size={12} />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-center">
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${config.bg} ${config.color} ${config.border}`}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })
      )}
    </div>
  )
}
