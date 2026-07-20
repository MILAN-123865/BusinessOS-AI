'use client'

import { CalendarEvent, EVENT_TYPE_CONFIG } from '@/types/calendar'
import { formatDateTime, getRelativeTime } from '@/lib/calendar-utils'
import { CalendarDays, ArrowRight } from 'lucide-react'

interface UpcomingEventsProps {
  events: CalendarEvent[]
  onSelectEvent?: (event: CalendarEvent) => void
}

export function UpcomingEvents({ events = [], onSelectEvent }: UpcomingEventsProps) {
  // Filter out meetings and past events
  const generalEvents = events
    .filter((e) => e.event_type !== 'meeting' && new Date(e.start) >= new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  return (
    <div className="rounded-2xl border border-border/40 bg-card/30 p-5 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-border/20 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <CalendarDays size={14} className="text-accent" />
          Upcoming Events & Leaves
        </h3>
        <span className="text-xs font-bold text-accent">{generalEvents.length} total</span>
      </div>

      <div className="space-y-3">
        {generalEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No upcoming events listed.</p>
        ) : (
          generalEvents.slice(0, 5).map((e) => {
            const config = EVENT_TYPE_CONFIG[e.event_type] ?? EVENT_TYPE_CONFIG.company_event
            return (
              <div
                key={e.id}
                onClick={() => onSelectEvent?.(e)}
                className="group flex items-center justify-between gap-4 rounded-xl border border-border/20 bg-card/45 p-3.5 cursor-pointer hover:bg-card/60 hover:border-accent/20 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${config.bg} border ${config.border}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground group-hover:text-accent transition-colors truncate">
                      {e.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {e.all_day ? 'All Day' : formatDateTime(e.start)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-right">
                  <span className="text-[9px] font-semibold text-muted-foreground block">
                    {getRelativeTime(e.start)}
                  </span>
                  <ArrowRight size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
