'use client'

import { Skeleton } from './Skeleton'

interface TableSkeletonProps {
  rows?: number
}

export function TableSkeleton({ rows = 5 }: TableSkeletonProps) {
  return (
    <div className="rounded-lg border border-[#1E2638] bg-[#0B1020] overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 bg-[#070B14] p-4 border-b border-[#1E2638] gap-4">
        <Skeleton className="col-span-5 h-4" />
        <Skeleton className="col-span-3 h-4" />
        <Skeleton className="col-span-2 h-4" />
        <Skeleton className="col-span-2 h-4" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#1E2638] p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-4 items-center pt-2">
            <Skeleton className="col-span-5 h-4" />
            <Skeleton className="col-span-3 h-3" />
            <Skeleton className="col-span-2 h-3" />
            <Skeleton className="col-span-2 h-3" />
          </div>
        ))}
      </div>
    </div>
  )
}
