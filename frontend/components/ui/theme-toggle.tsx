'use client'

import * as React from 'react'
import { useTheme } from '@/components/providers/theme-provider'
import { Sun, Moon, Monitor } from 'lucide-react'
import { motion } from 'framer-motion'

interface ThemeToggleProps {
  variant?: 'icon' | 'segmented' | 'compact'
  className?: string
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`h-8 w-8 rounded-lg bg-[#E0F2FE]/50 dark:bg-slate-800 animate-pulse ${className}`} />
    )
  }

  const isDark = resolvedTheme === 'dark'

  if (variant === 'segmented') {
    return (
      <div className={`flex items-center gap-1 p-1 rounded-xl bg-[#F1F5F9] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            theme === 'light'
              ? 'bg-white text-[#0284C7] shadow-xs'
              : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
          }`}
          title="Light Theme"
        >
          <Sun size={14} />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-slate-900 text-sky-400 shadow-xs'
              : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
          }`}
          title="Dark Theme"
        >
          <Moon size={14} />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            theme === 'system'
              ? 'bg-white dark:bg-slate-900 text-[#0284C7] dark:text-sky-400 shadow-xs'
              : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
          }`}
          title="System Auto"
        >
          <Monitor size={14} />
          <span>Auto</span>
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white/80 dark:bg-slate-800/90 text-[#475569] dark:text-slate-300 shadow-xs hover:border-[#BAE6FD] dark:hover:border-sky-500/50 hover:bg-[#F0F7FF] dark:hover:bg-slate-700 hover:text-[#0284C7] dark:hover:text-sky-400 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0284C7] dark:focus:ring-sky-500 ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0.5, rotate: 30, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-400" />
        ) : (
          <Moon className="h-4 w-4 text-[#0284C7]" />
        )}
      </motion.div>
    </button>
  )
}
