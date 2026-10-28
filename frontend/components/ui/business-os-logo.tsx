'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTheme } from '@/components/providers/theme-provider'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number
  showWordmark?: boolean
  showTagline?: boolean
  variant?: 'light' | 'dark' | 'auto'
  className?: string
}

export function BusinessOSLogo({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  variant = 'auto',
  className = '',
}: LogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Resolve actual theme
  let effectiveTheme: 'light' | 'dark' = 'light'
  if (variant === 'light') {
    effectiveTheme = 'light'
  } else if (variant === 'dark') {
    effectiveTheme = 'dark'
  } else if (mounted && resolvedTheme === 'dark') {
    effectiveTheme = 'dark'
  }

  // Size height maps
  const heightMap: Record<string, { h: number; iconH: number }> = {
    sm: { h: 26, iconH: 26 },
    md: { h: 32, iconH: 32 },
    lg: { h: 42, iconH: 42 },
    xl: { h: 52, iconH: 52 },
  }

  const heightVal = typeof size === 'number' ? size : (heightMap[size]?.h || 32)
  const iconHeight = typeof size === 'number' ? size : (heightMap[size]?.iconH || 32)

  // Ratio calculations:
  // Logo image full is approx 5:1 ratio (width:height)
  // Icon is 1:1 ratio
  const fullWidth = Math.round(heightVal * 4.6)
  const iconWidth = iconHeight

  if (!showWordmark) {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <Image
          src="/logos/logo-icon.png"
          alt="BusinessOS AI Icon"
          width={iconWidth}
          height={iconHeight}
          style={{ width: 'auto', height: `${iconHeight}px` }}
          className="object-contain transition-transform duration-200 hover:scale-105"
          priority
        />
      </div>
    )
  }

  const logoSrc = effectiveTheme === 'dark' ? '/logos/logo-dark.png' : '/logos/logo-light.png'

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <div className="flex items-center">
        <Image
          src={logoSrc}
          alt="BusinessOS AI Logo"
          width={fullWidth}
          height={heightVal}
          style={{ width: 'auto', height: `${heightVal}px` }}
          className="object-contain transition-opacity duration-200"
          priority
        />
      </div>
      {showTagline && (
        <span
          className={`text-[8px] font-extrabold tracking-[0.22em] uppercase mt-0.5 ${
            effectiveTheme === 'dark' ? 'text-slate-400' : 'text-[#64748B]'
          }`}
        >
          OPERATE • AUTOMATE • GROW
        </span>
      )}
    </div>
  )
}
