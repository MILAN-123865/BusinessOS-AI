'use client'

import { CalendarDays, ShieldAlert, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface CalendarHeaderProps {
  title?: string
  description?: string
}

export function CalendarHeader({
  title = 'Enterprise Scheduler',
  description = 'Consolidate organizational tasks, client meetings, leaves, and deadlines in one place.',
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border/20 pb-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/20 p-3 text-accent border border-accent/20">
          <CalendarDays size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            {title}
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
              <Sparkles size={10} />
              AI Orchestrator
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/40 bg-card/30 p-3">
        <ShieldAlert size={16} className="text-accent" />
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Access Context
          </p>
          <p className="text-xs font-semibold text-foreground">
            Enterprise Tenant Workstation
          </p>
        </div>
      </div>
    </div>
  )
}
