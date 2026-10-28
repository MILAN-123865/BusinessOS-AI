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
          <div key={i} className="h-48 rounded-2xl bg-white animate-pulse border border-[#E2E8F0]" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* 1. Today's Meetings */}
      <Card className="border-[#E2E8F0] bg-white shadow-xs hover:border-[#BAE6FD] hover:shadow-md transition-all">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-bold text-[#0F172A]">Today&apos;s Meetings</CardTitle>
            <CardDescription className="text-xs text-[#64748B]">Scheduled discussions</CardDescription>
          </div>
          <div className="rounded-lg bg-[#E0F2FE] p-2 text-[#0284C7] border border-[#BAE6FD]">
            <Video size={16} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {todaysMeetings.length === 0 ? (
            <p className="text-xs text-[#64748B] py-4">No meetings scheduled for today.</p>
          ) : (
            todaysMeetings.slice(0, 3).map((m) => (
              <Link href={`/meetings/${m.id}`} key={m.id} className="block group">
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 hover:bg-[#F0F7FF] hover:border-[#BAE6FD] transition-all flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#0284C7] transition-colors truncate">
                      {m.title}
                    </p>
                    <p className="text-[10px] text-[#64748B] mt-0.5 flex items-center gap-1 font-medium">
                      <Clock size={10} />
                      {formatTime(m.start_time)}
                    </p>
                  </div>
                  <ArrowRight size={12} className="text-[#0284C7] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* 2. Today's Tasks */}
      <Card className="border-[#E2E8F0] bg-white shadow-xs hover:border-[#BAE6FD] hover:shadow-md transition-all">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-bold text-[#0F172A]">Today&apos;s Tasks</CardTitle>
            <CardDescription className="text-xs text-[#64748B]">Due for completion</CardDescription>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 border border-emerald-200">
            <ClipboardList size={16} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {todaysTasks.length === 0 ? (
            <p className="text-xs text-[#64748B] py-4">No tasks due today.</p>
          ) : (
            todaysTasks.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0F172A] truncate">{t.title}</p>
                  <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">
                    {t.all_day ? 'All Day' : formatTime(t.start)}
                  </p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[9px] font-bold uppercase shrink-0">
                  Due
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 3. Upcoming Events */}
      <Card className="border-[#E2E8F0] bg-white shadow-xs hover:border-[#BAE6FD] hover:shadow-md transition-all">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-bold text-[#0F172A]">Upcoming Events</CardTitle>
            <CardDescription className="text-xs text-[#64748B]">Next holidays & leaves</CardDescription>
          </div>
          <div className="rounded-lg bg-[#E0F2FE] p-2 text-[#0284C7] border border-[#BAE6FD]">
            <CalendarDays size={16} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingEvents.length === 0 ? (
            <p className="text-xs text-[#64748B] py-4">No events or leaves listed.</p>
          ) : (
            upcomingEvents.slice(0, 3).map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0F172A] truncate">{e.title}</p>
                  <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">
                    {formatShortDate(new Date(e.start))}
                  </p>
                </div>
                <span className="text-[9px] font-semibold text-[#64748B] shrink-0">
                  {getRelativeTime(e.start)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 4. Upcoming Deadlines */}
      <Card className="border-[#E2E8F0] bg-white shadow-xs hover:border-[#BAE6FD] hover:shadow-md transition-all">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-bold text-[#0F172A]">Upcoming Deadlines</CardTitle>
            <CardDescription className="text-xs text-[#64748B]">Project milestones</CardDescription>
          </div>
          <div className="rounded-lg bg-rose-50 p-2 text-rose-600 border border-rose-200">
            <AlertTriangle size={16} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingDeadlines.length === 0 ? (
            <p className="text-xs text-[#64748B] py-4">No deadlines upcoming.</p>
          ) : (
            upcomingDeadlines.slice(0, 3).map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0F172A] truncate">{d.title}</p>
                  <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">
                    Due {formatShortDate(new Date(d.start))}
                  </p>
                </div>
                <Badge className="bg-rose-50 text-rose-700 border-0 text-[9px] font-bold uppercase shrink-0">
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
