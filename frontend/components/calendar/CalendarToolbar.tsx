'use client'

import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Grid3x3,
  List,
  Rows3,
  LayoutList,
  RefreshCw,
} from 'lucide-react'
import { CalendarView } from '@/types/calendar'
import { formatDate, addMonths, addDays, startOfWeek } from '@/lib/calendar-utils'

interface CalendarToolbarProps {
  currentDate: Date
  view: CalendarView
  searchQuery: string
  onDateChange: (date: Date) => void
  onViewChange: (view: CalendarView) => void
  onSearchChange: (q: string) => void
  onCreateEvent: () => void
  onCreateMeeting: () => void
  onToggleFilters: () => void
  isLoading?: boolean
}

const VIEW_BUTTONS: { view: CalendarView; icon: React.ReactNode; label: string }[] = [
  { view: 'month', icon: <Grid3x3 size={16} />, label: 'Month' },
  { view: 'week', icon: <Rows3 size={16} />, label: 'Week' },
  { view: 'day', icon: <List size={16} />, label: 'Day' },
  { view: 'agenda', icon: <LayoutList size={16} />, label: 'Agenda' },
]

function getDateLabel(date: Date, view: CalendarView): string {
  if (view === 'month') {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  if (view === 'week') {
    const weekStart = startOfWeek(date)
    const weekEnd = addDays(weekStart, 6)
    const startLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endLabel = weekEnd.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return `${startLabel} – ${endLabel}`
  }
  if (view === 'day') {
    return formatDate(date)
  }
  return 'Agenda'
}

function navigateDate(date: Date, view: CalendarView, dir: -1 | 1): Date {
  if (view === 'month') return addMonths(date, dir)
  if (view === 'week') return addDays(date, dir * 7)
  if (view === 'day') return addDays(date, dir)
  return addDays(date, dir * 14)
}

export function CalendarToolbar({
  currentDate,
  view,
  searchQuery,
  onDateChange,
  onViewChange,
  onSearchChange,
  onCreateEvent,
  onCreateMeeting,
  onToggleFilters,
  isLoading,
}: CalendarToolbarProps) {
  const goToToday = () => onDateChange(new Date())
  const goPrev = () => onDateChange(navigateDate(currentDate, view, -1))
  const goNext = () => onDateChange(navigateDate(currentDate, view, 1))

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/40 bg-card/30 backdrop-blur-md px-4 py-3 sticky top-0 z-20">
      {/* Left: Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={goToToday}
          className="rounded-lg border border-border/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all"
        >
          Today
        </button>
        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={goPrev}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all"
          >
            <ChevronLeft size={18} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={goNext}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all"
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>
        <h2 className="text-base font-bold text-foreground min-w-[180px]">
          {getDateLabel(currentDate, view)}
        </h2>
        {isLoading && (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <RefreshCw size={14} className="text-muted-foreground" />
          </motion.div>
        )}
      </div>

      {/* Center: Search */}
      <div className="relative flex-1 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search events, meetings…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-border/40 bg-background/50 pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent transition-all"
        />
      </div>

      {/* Right: View switcher + Actions */}
      <div className="flex items-center gap-2">
        {/* View Switcher */}
        <div className="flex items-center rounded-xl border border-border/40 bg-card/30 p-0.5 gap-0.5">
          {VIEW_BUTTONS.map((btn) => (
            <button
              key={btn.view}
              onClick={() => onViewChange(btn.view)}
              title={btn.label}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                view === btn.view
                  ? 'bg-primary/30 text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {btn.icon}
              <span className="hidden sm:inline">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Filter */}
        <button
          onClick={onToggleFilters}
          className="flex items-center gap-1.5 rounded-xl border border-border/40 bg-card/30 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
        >
          <Filter size={14} />
          <span className="hidden sm:inline">Filters</span>
        </button>

        {/* Create buttons */}
        <button
          onClick={onCreateMeeting}
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-accent/20 bg-primary/20 px-3 py-2 text-xs font-semibold text-accent hover:bg-primary/30 transition-all"
        >
          <Plus size={14} />
          Meeting
        </button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCreateEvent}
          className="flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-foreground hover:opacity-90 transition-all"
        >
          <Plus size={14} />
          <span>Event</span>
        </motion.button>
      </div>
    </div>
  )
}
