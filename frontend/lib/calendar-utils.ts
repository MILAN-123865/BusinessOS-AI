import { CalendarEvent } from '../types/calendar'

// ─────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function startOfWeek(date: Date, weekStartsOn = 0): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfWeek(date: Date, weekStartsOn = 0): Date {
  const start = startOfWeek(date, weekStartsOn)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function isBetween(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDuration(startStr: string, endStr: string): string {
  const start = new Date(startStr)
  const end = new Date(endStr)
  const ms = end.getTime() - start.getTime()
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

// ─────────────────────────────────────────────
// Calendar grid builder
// ─────────────────────────────────────────────

export function buildMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay() // 0=Sun
  const endPad = 6 - lastDay.getDay()

  const days: Date[] = []

  for (let i = startPad; i > 0; i--) {
    days.push(addDays(firstDay, -i))
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  for (let i = 1; i <= endPad; i++) {
    days.push(addDays(lastDay, i))
  }

  // Pad to complete 6 rows (42 cells)
  while (days.length < 42) {
    days.push(addDays(days[days.length - 1], 1))
  }

  return days
}

export function buildWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

// ─────────────────────────────────────────────
// Event filtering helpers
// ─────────────────────────────────────────────

export function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((e) => {
    const start = new Date(e.start)
    const end = new Date(e.end)
    // Check if day falls within the event range
    const dayStart = new Date(day)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(day)
    dayEnd.setHours(23, 59, 59, 999)
    return start <= dayEnd && end >= dayStart
  })
}

export function sortEventsByTime(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )
}

// ─────────────────────────────────────────────
// Relative time
// ─────────────────────────────────────────────

export function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const absDiff = Math.abs(diff)
  const isPast = diff < 0

  const minutes = Math.floor(absDiff / 60000)
  const hours = Math.floor(absDiff / 3600000)
  const days = Math.floor(absDiff / 86400000)

  if (minutes < 1) return isPast ? 'Just now' : 'In a moment'
  if (minutes < 60) return isPast ? `${minutes}m ago` : `In ${minutes}m`
  if (hours < 24) return isPast ? `${hours}h ago` : `In ${hours}h`
  if (days < 7) return isPast ? `${days}d ago` : `In ${days}d`
  return formatShortDate(date)
}

// ─────────────────────────────────────────────
// Meeting/event colour helpers
// ─────────────────────────────────────────────

export const EVENT_COLORS = [
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Violet', value: '#8B5CF6' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Rose', value: '#F43F5E' },
  { label: 'Cyan', value: '#06B6D4' },
  { label: 'Orange', value: '#F97316' },
  { label: 'Pink', value: '#EC4899' },
]

export function getDefaultEventColor(eventType: string): string {
  const colorMap: Record<string, string> = {
    meeting: '#3B82F6',
    task: '#10B981',
    deadline: '#F43F5E',
    reminder: '#F59E0B',
    leave: '#8B5CF6',
    holiday: '#EC4899',
    company_event: '#06B6D4',
    birthday: '#F97316',
  }
  return colorMap[eventType] ?? '#3B82F6'
}

// ─────────────────────────────────────────────
// Hours array for time slots (day/week view)
// ─────────────────────────────────────────────

export function buildHourSlots(): string[] {
  return Array.from({ length: 24 }, (_, i) => {
    const h = i % 12 === 0 ? 12 : i % 12
    const ampm = i < 12 ? 'AM' : 'PM'
    return `${h}:00 ${ampm}`
  })
}
