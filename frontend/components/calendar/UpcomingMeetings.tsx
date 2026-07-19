'use client'

import { Meeting, MEETING_TYPE_CONFIG } from '@/types/meeting'
import { formatDateTime, getRelativeTime } from '@/lib/calendar-utils'
import { Video, Clock, ArrowRight } from 'lucide-react'

interface UpcomingMeetingsProps {
  meetings: Meeting[]
  onSelectMeeting?: (meeting: Meeting) => void
}

export function UpcomingMeetings({ meetings = [], onSelectMeeting }: UpcomingMeetingsProps) {
  const activeMeetings = meetings
    .filter((m) => new Date(m.start_time) >= new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  return (
    <div className="rounded-2xl border border-border/40 bg-card/30 p-5 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-border/20 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Video size={14} className="text-accent" />
          Upcoming Team Meetings
        </h3>
        <span className="text-xs font-bold text-accent">{activeMeetings.length} total</span>
      </div>

      <div className="space-y-3">
        {activeMeetings.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No upcoming meetings scheduled.</p>
        ) : (
          activeMeetings.slice(0, 5).map((m) => {
            const config = MEETING_TYPE_CONFIG[m.meeting_type] ?? MEETING_TYPE_CONFIG.online
            return (
              <div
                key={m.id}
                onClick={() => onSelectMeeting?.(m)}
                className="group flex items-center justify-between gap-4 rounded-xl border border-border/20 bg-card/45 p-3.5 cursor-pointer hover:bg-card/60 hover:border-accent/20 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${config.bg}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground group-hover:text-accent transition-colors truncate">
                      {m.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock size={10} />
                      {formatDateTime(m.start_time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-right">
                  <span className="text-[9px] font-semibold text-muted-foreground block">
                    {getRelativeTime(m.start_time)}
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
