'use client'

import { useState } from 'react'
import {
  ChevronRight,
  Menu,
  X,
  Settings,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  CheckSquare,
  Users,
  FolderOpen,
  Building2,
  FileText,
  BarChart3,
  Search,
  Shield,
  Calendar,
  MessageSquare,
  GitBranch,
  KeyRound,
  Sparkles,
  UserCheck,
  RefreshCw,
  ChevronDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useLogout, useLogin } from '@/hooks/useAuth'

interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  href: string
  badge?: string | number
  adminOnly?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
  badge?: string
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false)
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()
  const loginMutation = useLogin()

  const isAdmin = user?.is_superuser || user?.email?.includes('admin') || !user

  const navSections: NavSection[] = [
    {
      title: 'Workspace',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Sparkles, label: 'AI Copilot', href: '/ai-assistant', badge: 'AI' },
        { icon: CheckSquare, label: 'Tasks & Kanban', href: '/tasks' },
        { icon: FolderOpen, label: 'Projects', href: '/projects' },
        { icon: Building2, label: 'Clients', href: '/clients' },
        { icon: Calendar, label: 'Calendar & Meetings', href: '/calendar' },
        { icon: FileText, label: 'Documents', href: '/documents' },
        { icon: MessageSquare, label: 'Team Chat', href: '/chat' },
      ],
    },
    {
      title: isAdmin ? 'Enterprise Admin' : 'Operations',
      badge: isAdmin ? 'Admin' : undefined,
      items: [
        ...(isAdmin ? [
          { icon: Building2, label: 'Organization', href: '/organization', adminOnly: true },
          { icon: Users, label: 'Employees', href: '/employees' },
          { icon: Shield, label: 'Roles & RBAC', href: '/roles', adminOnly: true },
          { icon: KeyRound, label: 'Permissions', href: '/permissions', adminOnly: true },
        ] : [
          { icon: Users, label: 'Team Directory', href: '/employees' },
        ]),
        { icon: GitBranch, label: 'Workflows', href: '/workflows' },
      ],
    },
    {
      title: 'Insights & System',
      items: [
        { icon: BarChart3, label: 'Analytics', href: '/analytics' },
        { icon: Bell, label: 'Notifications', href: '/notifications' },
        { icon: Settings, label: 'Settings', href: '/settings' },
      ],
    },
  ]

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) return true
    return pathname?.startsWith(href)
  }

  const handleRoleSwitch = (email: string) => {
    loginMutation.mutate({ username: email, password: 'Admin123!' })
    setShowRoleSwitcher(false)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-xl border border-border/60 bg-card/90 p-2.5 shadow-md backdrop-blur-md lg:hidden"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 270 : 76,
          x: 0,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`fixed left-0 top-0 z-40 h-screen flex-col border-r border-sidebar-border bg-sidebar shadow-xl lg:flex ${
          isOpen ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Logo Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 bg-white">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4F46E5] shadow-sm">
              <Sparkles size={18} className="text-white" />
            </div>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tracking-tight text-[#111827]">BusinessOS</span>
                  <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-[#4F46E5]">AI</span>
                </div>
                <span className="text-[11px] font-medium text-[#6B7280]">Enterprise Workspace</span>
              </motion.div>
            )}
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden rounded-lg p-1.5 text-[#6B7280] hover:bg-slate-100 hover:text-[#111827] transition-all lg:flex cursor-pointer"
            title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            <ChevronRight
              size={16}
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Quick Search Shortcut Banner */}
        {isOpen && (
          <div className="px-3 pt-3">
            <button
              onClick={() => {
                // @ts-ignore
                if (window.openCommandPalette) window.openCommandPalette()
              }}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-[#F8FAFC] px-3 py-2 text-xs text-[#6B7280] transition-all hover:border-[#4F46E5]/40 hover:bg-white hover:text-[#111827] cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Search size={14} />
                <span>Search anything...</span>
              </div>
              <kbd className="rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#6B7280]">Ctrl+K</kbd>
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {isOpen && (
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    {section.title}
                  </h3>
                  {section.badge && (
                    <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[9px] font-bold text-[#4F46E5] uppercase">
                      {section.badge}
                    </span>
                  )}
                </div>
              )}
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActiveRoute(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={!isOpen ? item.label : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        active
                          ? 'bg-indigo-50 text-[#4F46E5] font-semibold shadow-2xs border border-indigo-100'
                          : 'text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]'
                      }`}
                    >
                      <Icon
                        size={18}
                        className={`shrink-0 transition-colors ${
                          active ? 'text-[#4F46E5]' : 'text-[#6B7280] group-hover:text-[#111827]'
                        }`}
                      />
                      {isOpen && (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}
                      {isOpen && item.badge && (
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-[#4F46E5]">
                          {item.badge}
                        </span>
                      )}
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 h-5 w-1 rounded-r-full bg-[#4F46E5]"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Demo Role Switcher Popup */}
        <AnimatePresence>
          {showRoleSwitcher && isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mx-3 mb-2 rounded-2xl border border-indigo-200 bg-white p-3 shadow-xl space-y-2 z-50"
            >
              <div className="flex items-center justify-between pb-1 border-b border-border text-xs font-semibold text-slate-700">
                <span>Switch Demo Profile</span>
                <span className="text-[10px] text-indigo-600 font-bold">1-Click</span>
              </div>
              <button
                onClick={() => handleRoleSwitch('admin@example.com')}
                className="w-full text-left p-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-900">Milan Rathod</p>
                  <p className="text-[10px] text-slate-500">Administrator (All Access)</p>
                </div>
                <Shield size={14} className="text-indigo-600" />
              </button>
              <button
                onClick={() => handleRoleSwitch('andrew.fuller@northwind.com')}
                className="w-full text-left p-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-900">Andrew Fuller</p>
                  <p className="text-[10px] text-slate-500">VP Sales & Operations</p>
                </div>
                <Users size={14} className="text-indigo-600" />
              </button>
              <button
                onClick={() => handleRoleSwitch('nancy.davolio@northwind.com')}
                className="w-full text-left p-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-900">Nancy Davolio</p>
                  <p className="text-[10px] text-slate-500">Sales Representative</p>
                </div>
                <UserCheck size={14} className="text-indigo-600" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Footer Profile Card */}
        <div className="shrink-0 border-t border-border p-3 bg-white">
          <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] p-2 border border-border">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex flex-1 items-center gap-2.5 overflow-hidden text-left group"
              title="Click to switch demo role"
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-[#4F46E5] font-bold text-xs">
                {user?.first_name ? user.first_name[0] : 'M'}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#16A34A]" />
              </div>
              {isOpen && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="truncate text-xs font-semibold text-[#111827] group-hover:text-[#4F46E5] transition-colors flex items-center gap-1">
                    {user ? `${user.first_name} ${user.last_name}` : 'Milan Rathod'}
                    <ChevronDown size={12} className="text-slate-400" />
                  </p>
                  <p className="truncate text-[10px] text-[#6B7280]">
                    {isAdmin ? 'System Admin' : 'Sales Representative'}
                  </p>
                </div>
              )}
            </button>

            {isOpen && (
              <button
                onClick={logout}
                title="Sign Out"
                className="ml-1 rounded-lg p-1.5 text-[#6B7280] hover:bg-red-50 hover:text-[#DC2626] transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Spacer for Main Content on Desktop */}
      <motion.div
        animate={{ width: isOpen ? 270 : 76 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="hidden shrink-0 lg:block"
      />
    </>
  )
}
