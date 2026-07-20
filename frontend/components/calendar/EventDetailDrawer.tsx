'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CalendarEvent, EVENT_TYPE_CONFIG, EventType } from '@/types/calendar'
import { X, Clock, MapPin, Users, Video, ExternalLink, Trash2, Edit3, CalendarDays } from 'lucide-react'
import { formatDateTime, formatDuration } from '@/lib/calendar-utils'

interface EventDetailDrawerProps {
  event: CalendarEvent | null
  onClose: () => void
  onEdit?: (event: CalendarEvent) => void
  onDelete?: (event: CalendarEvent) => void
}

export function EventDetailDrawer({ event, onClose, onEdit, onDelete }: EventDetailDrawerProps) {
  if (!event) return null

  const config = EVENT_TYPE_CONFIG[event.event_type] ?? EVENT_TYPE_CONFIG.meeting

  return (
    <AnimatePresence>
      {event && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto border-l border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl"
          >
            {/* Header */}
            <div
              className={`relative px-6 py-5 border-b border-border/40 ${config.bg}`}
              style={event.color ? { backgroundColor: event.color + '20', borderColor: event.color + '40' } : {}}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase mb-2 ${config.bg} ${config.color} border ${config.border}`}>
                    {config.label}
                  </span>
                  <h2 className="text-xl font-bold text-foreground break-words">{event.title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(event)}
                    className="flex items-center gap-1.5 rounded-xl border border-border/40 bg-card/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Edit3 size={13} />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(event)}
                    className="flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Time */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-primary/20 p-2">
                  <Clock size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {event.all_day ? 'All Day' : (
                      <>
                        {formatDateTime(event.start)}
                        <span className="text-muted-foreground mx-1">–</span>
                        {formatDateTime(event.end)}
                      </>
                    )}
                  </p>
                  {!event.all_day && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Duration: {formatDuration(event.start, event.end)}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-primary/20 p-2">
                    <MapPin size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-0.5">Location</p>
                    <p className="text-sm text-foreground">{event.location}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="rounded-xl border border-border/40 bg-card/30 p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                    <CalendarDays size={12} />
                    Description
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>
              )}

              {/* Participants */}
              {event.attendees && event.attendees.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Users size={12} />
                    Participants ({event.attendees.length})
                  </p>
                  <div className="space-y-2">
                    {event.attendees.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 px-3 py-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/30 text-xs font-bold text-accent">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project link */}
              {event.project && (
                <div className="rounded-xl border border-border/40 bg-card/30 p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Project</p>
                  <p className="text-sm font-semibold text-accent">{event.project.name}</p>
                </div>
              )}

              {/* Metadata */}
              {event.created_at && (
                <p className="text-xs text-muted-foreground">
                  Created {formatDateTime(event.created_at)}
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
