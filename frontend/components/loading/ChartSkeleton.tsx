'use client'

import { Skeleton } from './Skeleton'

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-lg border border-[#1E2638] bg-[#0B1020] p-5 space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="pt-2 flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-[#1E2638] bg-[#0B1020] p-5 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-44 w-full" />
    </div>
  )
}
