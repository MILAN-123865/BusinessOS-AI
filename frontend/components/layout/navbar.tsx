'use client'

import React, { useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NotificationCenter } from '@/components/ui/notification-center'
import { RbacSimulatorBanner } from '@/components/ui/rbac-simulator-banner'
import { useAuthStore } from '@/store/authStore'

const ROUTE_LABELS: Record<string, { parent: string; title: string }> = {
  '/dashboard': { parent: 'Workspace', title: 'Dashboard' },
  '/ai-assistant': { parent: 'Workspace', title: 'AI Copilot' },
  '/tasks': { parent: 'Workspace', title: 'Tasks & Kanban' },
  '/projects': { parent: 'Workspace', title: 'Projects' },
  '/clients': { parent: 'Workspace', title: 'Clients' },
  '/finance': { parent: 'Workspace', title: 'Finance & Invoices' },
  '/calendar': { parent: 'Workspace', title: 'Calendar & Meetings' },
  '/documents': { parent: 'Workspace', title: 'Document Management' },
  '/chat': { parent: 'Workspace', title: 'Team Chat' },
  '/organization': { parent: 'Enterprise', title: 'Organization' },
  '/employees': { parent: 'Enterprise', title: 'Employee Directory' },
  '/roles': { parent: 'Enterprise', title: 'Roles & RBAC' },
  '/permissions': { parent: 'Enterprise', title: 'Permissions Matrix' },
  '/rbac-simulator': { parent: 'Enterprise', title: 'RBAC Sandbox & Simulator' },
  '/workflows': { parent: 'Enterprise', title: 'Automated Workflows' },
  '/analytics': { parent: 'Insights', title: 'Analytics & Reports' },
  '/notifications': { parent: 'Insights', title: 'Notifications' },
  '/settings': { parent: 'System', title: 'Settings' },
  '/profile': { parent: 'Account', title: 'My Profile' },
}

export function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  const activeBreadcrumb = (pathname && ROUTE_LABELS[pathname]) || {
    parent: 'BusinessOS',
    title: pathname ? pathname.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Dashboard',
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#1E293B] bg-[#090E1B]/85 backdrop-blur-xl px-4 lg:px-8 shadow-md">
      {/* Left Section - Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs md:text-sm">
        <span className="font-medium text-slate-400">{activeBreadcrumb.parent}</span>
        <span className="text-slate-600">/</span>
        <span className="font-semibold text-white tracking-tight">{activeBreadcrumb.title}</span>
      </div>

      {/* Center Section - Quick Command Palette Search */}
      <div className="flex flex-1 max-w-md mx-4 items-center">
        <div
          onClick={() => {
            // @ts-ignore
            if (window.openCommandPalette) window.openCommandPalette()
          }}
          className={`group flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#1E293B] bg-[#101A2E] px-3.5 py-1.5 transition-all hover:border-cyan-500/40 hover:bg-[#132038] ${
            isSearchFocused ? 'border-cyan-500 ring-1 ring-cyan-500 bg-[#132038]' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <Search size={14} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <span className="text-xs text-slate-300">Quick search or ask AI...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center rounded border border-[#1E293B] bg-[#0E1626] px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right Section - RBAC Simulator Quick-Dock, Notifications & Profile */}
      <div className="flex items-center gap-3">
        <RbacSimulatorBanner />
        <NotificationCenter />
        <Link
          href="/profile"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-sm hover:ring-2 hover:ring-cyan-500/40 transition-all"
        >
          {user?.first_name ? user.first_name[0] : 'M'}
        </Link>
      </div>
    </header>
  )
}
