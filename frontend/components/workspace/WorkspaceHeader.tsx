'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings,
  Building2,
  Check
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { NotificationCenter } from '@/components/ui/notification-center'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const BREADCRUMB_MAP: Record<string, { category: string; label: string }> = {
  '/dashboard': { category: 'Workspace', label: 'Dashboard' },
  '/ai-assistant': { category: 'Workspace', label: 'AI Copilot' },
  '/tasks': { category: 'Workspace', label: 'Tasks & Kanban' },
  '/projects': { category: 'Workspace', label: 'Projects' },
  '/clients': { category: 'Workspace', label: 'Clients' },
  '/calendar': { category: 'Workspace', label: 'Calendar & Meetings' },
  '/documents': { category: 'Workspace', label: 'Documents' },
  '/chat': { category: 'Workspace', label: 'Team Chat' },
  '/organization': { category: 'Enterprise', label: 'Organization' },
  '/employees': { category: 'Enterprise', label: 'Employees' },
  '/roles': { category: 'Enterprise', label: 'Roles & RBAC' },
  '/permissions': { category: 'Enterprise', label: 'Permissions' },
  '/workflows': { category: 'Enterprise', label: 'Workflows' },
  '/analytics': { category: 'Insights', label: 'Analytics' },
  '/notifications': { category: 'Insights', label: 'Notifications' },
  '/settings': { category: 'System', label: 'Settings' },
  '/profile': { category: 'Account', label: 'My Profile' },
}

export function WorkspaceHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  const [activeWorkspace, setActiveWorkspace] = useState('Northwind Traders Inc.')
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const currentRouteInfo = (pathname && BREADCRUMB_MAP[pathname]) || {
    category: 'Workspace',
    label: pathname ? pathname.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Dashboard',
  }

  const handleOpenCommandPalette = () => {
    if (typeof window !== 'undefined' && (window as any).openCommandPalette) {
      ;(window as any).openCommandPalette()
    }
  }

  const handleLogout = () => {
    clearAuth()
    router.replace('/login')
  }

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-[#E2E8F0] dark:border-[#202F54] bg-white/95 dark:bg-[#0E1733]/95 backdrop-blur-xl px-4 lg:px-6 shadow-2xs transition-colors">
      <div className="flex h-full items-center justify-between gap-4">
        
        {/* Left: Clean Workspace Selector & Current Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          
          {/* Workspace Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
              className="flex items-center gap-2 rounded-xl bg-[#F0F7FF] dark:bg-sky-950/40 px-3 py-1.5 text-xs font-bold text-[#0284C7] dark:text-sky-400 hover:bg-[#E0F2FE] dark:hover:bg-sky-900/60 transition-colors border border-[#BAE6FD] dark:border-sky-800/50 cursor-pointer shadow-2xs"
            >
              <Building2 className="h-3.5 w-3.5 shrink-0 text-[#0284C7] dark:text-sky-400" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{activeWorkspace}</span>
              <ChevronDown className="h-3 w-3 text-[#0284C7] dark:text-sky-400 opacity-75" />
            </button>

            <AnimatePresence>
              {isWorkspaceOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsWorkspaceOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    className="absolute left-0 top-10 z-50 w-64 rounded-2xl border border-[#BAE6FD] dark:border-[#202F54] bg-white dark:bg-[#131E3A] p-2 shadow-2xl text-xs backdrop-blur-xl"
                  >
                    <p className="px-2.5 py-1.5 text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Switch Enterprise Workspace</p>
                    {['Northwind Traders Inc.', 'Global Supply Chain Operations', 'European Sales Division'].map((ws) => {
                      const isSelected = activeWorkspace === ws
                      return (
                        <button
                          key={ws}
                          onClick={() => {
                            setActiveWorkspace(ws)
                            setIsWorkspaceOpen(false)
                          }}
                          className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#E0F2FE] dark:bg-sky-950/70 text-[#0284C7] dark:text-sky-300 font-bold'
                              : 'text-[#475569] dark:text-slate-300 hover:bg-[#F0F7FF] dark:hover:bg-slate-800/80 hover:text-[#0284C7] dark:hover:text-sky-400'
                          }`}
                        >
                          <span className="truncate">{ws}</span>
                          {isSelected && <Check size={14} className="text-[#0284C7] dark:text-sky-400 shrink-0" />}
                        </button>
                      )
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <span className="text-[#CBD5E1] dark:text-slate-700 hidden sm:inline">/</span>

          {/* Clean Page Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] dark:text-slate-100 truncate">
            <span>{currentRouteInfo.label}</span>
          </div>
        </div>

        {/* Center: Clean Search Bar */}
        <div className="flex items-center flex-1 max-w-md justify-center px-2">
          <button
            onClick={handleOpenCommandPalette}
            className="flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] dark:border-[#202F54] bg-[#F8FAFC] dark:bg-[#131E3A] px-3.5 py-1.5 text-xs text-[#64748B] dark:text-slate-400 hover:border-[#0284C7]/60 hover:bg-[#F0F7FF] dark:hover:bg-slate-800/80 hover:text-[#0284C7] dark:hover:text-sky-400 transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
              <span className="hidden sm:inline font-medium">Search anything across workspace...</span>
              <span className="sm:hidden font-medium">Search...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-[#E2E8F0] dark:border-[#202F54] bg-white dark:bg-[#0E1733] px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#64748B] dark:text-slate-400 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Theme Toggle, Notifications & User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Theme Switcher (Light / Dark) */}
          <ThemeToggle />

          {/* Notifications Center */}
          <NotificationCenter />

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[#0284C7] text-white font-bold text-xs shadow-sm hover:ring-2 hover:ring-[#0284C7]/40 transition-all cursor-pointer"
              title="User Account"
            >
              {user?.first_name ? user.first_name[0] : 'M'}
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 4 }}
                    className="absolute right-0 top-10 z-50 w-56 rounded-2xl border border-[#BAE6FD] dark:border-[#202F54] bg-white dark:bg-[#131E3A] p-2 shadow-2xl text-xs backdrop-blur-xl"
                  >
                    <div className="px-2.5 py-2 border-b border-[#E2E8F0] dark:border-[#202F54] mb-1">
                      <p className="font-bold text-[#0F172A] dark:text-slate-100 truncate">
                        {user ? `${user.first_name} ${user.last_name}` : 'Milan Rathod'}
                      </p>
                      <p className="text-[10px] text-[#64748B] dark:text-slate-400 truncate">
                        {user?.email || 'admin@example.com'}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full rounded-lg px-2.5 py-1.5 text-[#475569] dark:text-slate-300 hover:bg-[#F0F7FF] dark:hover:bg-slate-800 hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors font-medium"
                    >
                      <User className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full rounded-lg px-2.5 py-1.5 text-[#475569] dark:text-slate-300 hover:bg-[#F0F7FF] dark:hover:bg-slate-800 hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors font-medium"
                    >
                      <Settings className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
                      <span>Workspace Settings</span>
                    </Link>

                    <div className="border-t border-[#E2E8F0] dark:border-[#202F54] my-1" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full rounded-lg px-2.5 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 transition-colors text-left font-semibold cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </header>
  )
}
