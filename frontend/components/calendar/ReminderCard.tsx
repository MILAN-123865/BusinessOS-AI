'use client'

import { Clock, AlertTriangle, Video, ClipboardList } from 'lucide-react'
import { getRelativeTime } from '@/lib/calendar-utils'

export type ReminderCategory = 'task' | 'deadline' | 'meeting' | 'personal'

interface ReminderCardProps {
  id: string
  title: string
  category: ReminderCategory
  dueTime: string
  description?: string
  onClick?: () => void
}

const CATEGORY_CONFIG: Record<
  ReminderCategory,
  { label: string; icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  task: {
    label: 'Task Due',
    icon: <ClipboardList size={14} />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  deadline: {
    label: 'Deadline',
    icon: <AlertTriangle size={14} />,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  meeting: {
    label: 'Meeting',
    icon: <Video size={14} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  personal: {
    label: 'Reminder',
    icon: <Clock size={14} />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
}

export function ReminderCard({
  title,
  category,
  dueTime,
  description,
  onClick,
}: ReminderCardProps) {
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.personal

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-start gap-3.5 rounded-2xl border p-4 backdrop-blur-md cursor-pointer transition-all hover:bg-card/50 hover:shadow-lg ${config.bg} ${config.border}`}
    >
      <div className={`rounded-xl p-2.5 ${config.color} bg-background/40 border border-border/20`}>
        {config.icon}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[9px] font-bold uppercase tracking-wider ${config.color}`}>
            {config.label}
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold">
            {getRelativeTime(dueTime)}
          </span>
        </div>

        <h4 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors truncate">
          {title}
        </h4>

        {description && (
          <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
