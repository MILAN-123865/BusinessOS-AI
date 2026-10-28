'use client'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#1E2638]/60 motion-reduce:animate-none ${className}`}
    />
  )
}
