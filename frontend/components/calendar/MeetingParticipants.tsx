'use client'

import { MeetingParticipant } from '@/types/meeting'
import { Check, Clock, X, AlertTriangle, Users } from 'lucide-react'

interface MeetingParticipantsProps {
  participants: MeetingParticipant[]
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  accepted: {
    label: 'Accepted',
    icon: <Check size={12} />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  declined: {
    label: 'Declined',
    icon: <X size={12} />,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  pending: {
    label: 'Pending',
    icon: <Clock size={12} />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  tentative: {
    label: 'Tentative',
    icon: <AlertTriangle size={12} />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
}

export function MeetingParticipants({ participants = [] }: MeetingParticipantsProps) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/30 p-5 backdrop-blur-md space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/20 pb-2">
        <Users size={14} className="text-accent" />
        Participant Roll ({participants.length})
      </h3>

      {participants.length === 0 ? (
        <p className="text-xs text-muted-foreground">No participants invited yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {participants.map((part) => {
            const user = part.user
            const status = part.status ?? 'pending'
            const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending

            return (
              <div
                key={part.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border/20 bg-card/45 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/30 text-xs font-bold text-accent">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user ? `${user.first_name} ${user.last_name}` : 'Unknown Guest'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
