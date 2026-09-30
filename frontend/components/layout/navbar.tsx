'use client'

import { Search, Plus, CheckSquare, FolderPlus, CalendarPlus, UserPlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NotificationCenter } from '@/components/ui/notification-center'
import { useAuthStore } from '@/store/authStore'

const ROUTE_LABELS: Record<string, { parent: string; title: string }> = {
  '/dashboard': { parent: 'Workspace', title: 'Dashboard' },
  '/ai-assistant': { parent: 'Workspace', title: 'AI Copilot' },
  '/tasks': { parent: 'Workspace', title: 'Tasks & Kanban' },
  '/projects': { parent: 'Workspace', title: 'Projects' },
  '/clients': { parent: 'Workspace', title: 'Clients' },
  '/calendar': { parent: 'Workspace', title: 'Calendar & Meetings' },
  '/documents': { parent: 'Workspace', title: 'Document Management' },
  '/chat': { parent: 'Workspace', title: 'Team Chat' },
  '/organization': { parent: 'Enterprise', title: 'Organization' },
  '/employees': { parent: 'Enterprise', title: 'Employee Directory' },
  '/roles': { parent: 'Enterprise', title: 'Roles & RBAC' },
  '/permissions': { parent: 'Enterprise', title: 'Permissions Matrix' },
  '/workflows': { parent: 'Enterprise', title: 'Automated Workflows' },
  '/analytics': { parent: 'Insights', title: 'Analytics & Reports' },
  '/notifications': { parent: 'Insights', title: 'Notifications' },
  '/settings': { parent: 'System', title: 'Settings' },
  '/profile': { parent: 'Account', title: 'My Profile' },
}

export function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  const activeBreadcrumb = (pathname && ROUTE_LABELS[pathname]) || {
    parent: 'BusinessOS',
    title: pathname ? pathname.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Dashboard',
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E5E7EB] bg-white px-4 lg:px-8 shadow-2xs">
      {/* Left Section - Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs md:text-sm">
        <span className="font-medium text-[#6B7280]">{activeBreadcrumb.parent}</span>
        <span className="text-[#E5E7EB]">/</span>
        <span className="font-semibold text-[#111827] tracking-tight">{activeBreadcrumb.title}</span>
      </div>

      {/* Center Section - Quick Command Palette Search */}
      <div className="flex flex-1 max-w-md mx-4 items-center">
        <div
          onClick={() => {
            // @ts-ignore
            if (window.openCommandPalette) window.openCommandPalette()
          }}
          className={`group flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-1.5 transition-all hover:border-[#4F46E5]/40 hover:bg-white ${
            isSearchFocused ? 'border-[#4F46E5] ring-1 ring-[#4F46E5] bg-white' : ''
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-[#6B7280] group-hover:text-[#111827]">
            <Search size={15} />
            <span>Search anything... (Ctrl+K)</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-[#E5E7EB] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#6B7280]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Quick Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
            className="flex items-center gap-1.5 rounded-xl bg-[#4F46E5] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#4338CA] transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New</span>
          </button>

          <AnimatePresence>
            {isQuickCreateOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsQuickCreateOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg text-xs"
                >
                  <Link
                    href="/tasks"
                    onClick={() => setIsQuickCreateOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827] transition-all"
                  >
                    <CheckSquare size={14} className="text-[#4F46E5]" />
                    <span>Create Task</span>
                  </Link>
                  <Link
                    href="/projects"
                    onClick={() => setIsQuickCreateOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827] transition-all"
                  >
                    <FolderPlus size={14} className="text-indigo-500" />
                    <span>Create Project</span>
                  </Link>
                  <Link
                    href="/calendar"
                    onClick={() => setIsQuickCreateOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827] transition-all"
                  >
                    <CalendarPlus size={14} className="text-[#16A34A]" />
                    <span>Schedule Meeting</span>
                  </Link>
                  <Link
                    href="/clients"
                    onClick={() => setIsQuickCreateOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827] transition-all"
                  >
                    <UserPlus size={14} className="text-[#D97706]" />
                    <span>Add Client</span>
                  </Link>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Center */}
        <NotificationCenter />

        {/* Profile Avatar Trigger */}
        <Link
          href="/profile"
          title="Account Profile"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-[#E5E7EB] text-[#111827] hover:border-[#4F46E5]/50 hover:bg-indigo-50 transition-all cursor-pointer"
        >
          <span className="text-xs font-bold text-[#4F46E5]">
            {user?.first_name ? user.first_name[0] : 'U'}
          </span>
        </Link>
      </div>
    </header>
  )
}
