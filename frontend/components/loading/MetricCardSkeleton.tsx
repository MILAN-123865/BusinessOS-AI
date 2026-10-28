'use client'

import { Skeleton } from './Skeleton'

export function MetricCardSkeleton() {
  return (
    <div className="rounded-lg border border-[#1E2638] bg-[#0B1020] p-4 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-2.5 w-16" />
    </div>
  )
}
