'use client'

import { useCalendarEvents } from '@/hooks/useCalendar'
import { useMeetings } from '@/hooks/useMeetings'
import { isToday, formatTime, formatShortDate, getRelativeTime } from '@/lib/calendar-utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Video, ClipboardList, CalendarDays, AlertTriangle, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

export function DashboardWidgets() {
  const { data: events = [], isLoading: eventsLoading } = useCalendarEvents()
  const { data: meetings = [], isLoading: meetingsLoading } = useMeetings()

  // 1. Today's Meetings
  const todaysMeetings = useMemo(() => {
    return meetings.filter((m) => isToday(new Date(m.start_time)))
  }, [meetings])

  // 2. Today's Tasks
  const todaysTasks = useMemo(() => {
    return events.filter((e) => e.event_type === 'task' && isToday(new Date(e.start)))
  }, [events])

  // 3. Upcoming Events (General/Company events)
  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => (e.event_type === 'company_event' || e.event_type === 'holiday' || e.event_type === 'leave') && new Date(e.start) >= new Date())
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }, [events])

  // 4. Upcoming Deadlines
  const upcomingDeadlines = useMemo(() => {
    return events
      .filter((e) => e.event_type === 'deadline' && new Date(e.start) >= new Date())
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }, [events])

  const isLoading = eventsLoading || meetingsLoading

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-card/45 animate-pulse border border-border/40" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* 1. Today's Meetings */}
      <Card className="border-border/40 bg-card/30 backdrop-blur-md hover:border-accent/30 transition-all">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-bold text-foreground">Today&apos;s Meetings</CardTitle>
            <CardDescription className="text-xs">Scheduled discussions</CardDescription>
          </div>
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400 border border-blue-500/20">
            <Video size={16} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {todaysMeetings.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4">No meetings scheduled for today.</p>
          ) : (
            todaysMeetings.slice(0, 3).map((m) => (
              <Link href={`/meetings/${m.id}`} key={m.id} className="block group">
                <div className="rounded-xl border border-border/20 bg-card/40 p-2.5 hover:bg-card/65 transition-all flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground group-hover:text-accent transition-colors truncate">
                      {m.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock size={10} />
                      {formatTime(m.start_time)}
                    </p>
                  </div>
                  <ArrowRight size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* 2. Today's Tasks */}
      <Card className="border-border/40 bg-card/30 backdrop-blur-md hover:border-accent/30 transition-all">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-bold text-foreground">Today&apos;s Tasks</CardTitle>
            <CardDescription className="text-xs">Due for completion</CardDescription>
          </div>
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
            <ClipboardList size={16} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {todaysTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4">No tasks due today.</p>
          ) : (
            todaysTasks.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-border/20 bg-card/40 p-2.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{t.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {t.all_day ? 'All Day' : formatTime(t.start)}
                  </p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[9px] font-bold uppercase shrink-0">
                  Due
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 3. Upcoming Events */}
      <Card className="border-border/40 bg-card/30 backdrop-blur-md hover:border-accent/30 transition-all">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-bold text-foreground">Upcoming Events</CardTitle>
            <CardDescription className="text-xs">Next holidays & leaves</CardDescription>
          </div>
          <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
            <CalendarDays size={16} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4">No events or leaves listed.</p>
          ) : (
            upcomingEvents.slice(0, 3).map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-border/20 bg-card/40 p-2.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{e.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatShortDate(new Date(e.start))}
                  </p>
                </div>
                <span className="text-[9px] font-semibold text-muted-foreground shrink-0">
                  {getRelativeTime(e.start)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 4. Upcoming Deadlines */}
      <Card className="border-border/40 bg-card/30 backdrop-blur-md hover:border-accent/30 transition-all">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-bold text-foreground">Upcoming Deadlines</CardTitle>
            <CardDescription className="text-xs">Project milestones</CardDescription>
          </div>
          <div className="rounded-lg bg-red-500/10 p-2 text-red-400 border border-red-500/20">
            <AlertTriangle size={16} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingDeadlines.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4">No deadlines upcoming.</p>
          ) : (
            upcomingDeadlines.slice(0, 3).map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-border/20 bg-card/40 p-2.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{d.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Due {formatShortDate(new Date(d.start))}
                  </p>
                </div>
                <Badge className="bg-red-500/10 text-red-400 border-0 text-[9px] font-bold uppercase shrink-0">
                  Milestone
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
