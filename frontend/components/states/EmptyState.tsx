'use client'

import { LucideIcon, Plus } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-[#1E2638] bg-[#0B1020] p-8 sm:p-12 text-center max-w-md mx-auto my-6">
      {Icon && (
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-[#070B14] border border-[#1E2638] text-[#5B5CE2] mb-4">
          <Icon className="h-5 w-5" />
        </div>
      )}

      <h3 className="text-base font-bold text-[#F7F8FC] mb-1">{title}</h3>
      <p className="text-xs text-[#A7AEC0] leading-relaxed mb-6">{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-lg bg-[#5B5CE2] px-4 py-2 text-xs font-medium text-white hover:bg-[#4E4FD1] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  )
}
