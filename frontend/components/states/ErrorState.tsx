'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Unable to load workspace data',
  description = "We couldn't retrieve the requested telemetry items. Check your network connection and try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-6 text-center max-w-md mx-auto my-6">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-[#070B14] border border-rose-500/30 text-rose-400 mb-3">
        <AlertTriangle className="h-5 w-5" />
      </div>

      <h3 className="text-sm font-bold text-[#F7F8FC] mb-1">{title}</h3>
      <p className="text-xs text-[#A7AEC0] leading-relaxed mb-4">{description}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg border border-[#1E2638] bg-[#0B1020] px-4 py-2 text-xs font-medium text-[#F7F8FC] hover:bg-[#12182B] transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  )
}
