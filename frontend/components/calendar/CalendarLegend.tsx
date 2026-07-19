'use client'

import { EVENT_TYPE_CONFIG, EventType } from '@/types/calendar'

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3.5 rounded-xl border border-border/40 bg-card/20 px-4 py-2.5 backdrop-blur-md">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
        Legend:
      </span>
      {(Object.keys(EVENT_TYPE_CONFIG) as EventType[]).map((type) => {
        const config = EVENT_TYPE_CONFIG[type]
        return (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${config.bg} border ${config.border}`} />
            <span className="text-[11px] font-semibold text-foreground/80">
              {config.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
