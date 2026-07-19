'use client'

import { motion } from 'framer-motion'
import { CalendarEvent } from '@/types/calendar'
import { EventCard } from './EventCard'
import {
  buildMonthGrid,
  getEventsForDay,
  isSameDay,
  isToday,
} from '@/lib/calendar-utils'

interface CalendarMonthProps {
  currentDate: Date
  events: CalendarEvent[]
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  onSelectEvent: (event: CalendarEvent) => void
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarMonth({
  currentDate,
  events,
  selectedDate,
  onSelectDate,
  onSelectEvent,
}: CalendarMonthProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const days = buildMonthGrid(year, month)

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border/40">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1" style={{ gridTemplateRows: 'repeat(6, minmax(120px, 1fr))' }}>
        {days.map((day, idx) => {
          const isCurrentMonth = day.getMonth() === month
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const today = isToday(day)
          const dayEvents = getEventsForDay(events, day)
          const maxVisible = 3
          const hiddenCount = Math.max(0, dayEvents.length - maxVisible)

          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.005 }}
              onClick={() => onSelectDate(day)}
              className={`relative flex flex-col gap-1 border-b border-r border-border/40 p-1.5 cursor-pointer transition-colors min-h-[120px] ${
                isCurrentMonth ? 'bg-transparent' : 'bg-card/10'
              } ${isSelected ? 'ring-1 ring-inset ring-accent' : ''} hover:bg-card/20`}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    today
                      ? 'bg-accent text-accent-foreground font-bold'
                      : isCurrentMonth
                      ? 'text-foreground'
                      : 'text-muted-foreground/40'
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>

              {/* Events */}
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayEvents.slice(0, maxVisible).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectEvent(event)
                    }}
                  >
                    <EventCard event={event} compact />
                  </div>
                ))}
                {hiddenCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectDate(day)
                    }}
                    className="text-left text-[10px] font-semibold text-muted-foreground hover:text-accent transition-colors pl-1"
                  >
                    +{hiddenCount} more
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
