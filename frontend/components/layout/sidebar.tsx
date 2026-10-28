'use client'

import React, { useState } from 'react'
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
  ChevronDown,
  Layers,
  Receipt,
  Boxes,
  BookOpen,
  Activity,
  Network,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useLogout, useLogin } from '@/hooks/useAuth'
import { BusinessOSLogo } from '@/components/ui/business-os-logo'
import { PRESET_SIMULATED_ROLES } from '@/types/rbac'

interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  href: string
  badge?: string | number
  visible?: boolean
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
  const router = useRouter()
  
  const user = useAuthStore((state) => state.user)
  const simulatedRole = useAuthStore((state) => state.simulatedRole)
  const isSuperuserEffective = useAuthStore((state) => state.isSuperuserEffective)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const setSimulatedRole = useAuthStore((state) => state.setSimulatedRole)
  const resetSimulation = useAuthStore((state) => state.resetSimulation)
  
  const logout = useLogout()

  // Warm-up and prefetch all primary workspace routes in idle background for instant 0ms switching
  useEffect(() => {
    const coreRoutes = [
      '/dashboard',
      '/calendar',
      '/tasks',
      '/projects',
      '/clients',
      '/inventory',
      '/employees',
      '/analytics',
      '/workflows',
      '/documents',
      '/knowledge-base',
      '/chat',
      '/ai-assistant',
      '/finance',
      '/organization/org-chart',
      '/roles',
      '/permissions',
      '/rbac-simulator',
      '/settings/diagnostics',
      '/settings',
      '/profile'
    ]
    coreRoutes.forEach((route) => {
      router.prefetch(route)
    })
  }, [router])

  const isSuperuser = isSuperuserEffective()

  const navSections: NavSection[] = [
    {
      title: 'Workspace',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', visible: hasPermission('dashboard.read') },
        { icon: Sparkles, label: 'AI Copilot', href: '/ai-assistant', badge: 'AI', visible: true },
        { icon: CheckSquare, label: 'Tasks & Kanban', href: '/tasks', visible: true },
        { icon: FolderOpen, label: 'Projects', href: '/projects', visible: hasPermission('projects.read') },
        { icon: Building2, label: 'Clients', href: '/clients', visible: hasPermission('clients.read') },
        { icon: Boxes, label: 'Inventory & SKUs', href: '/inventory', badge: 'Live', visible: true },
        { icon: Receipt, label: 'Finance & Invoices', href: '/finance', badge: 'PDF', visible: true },
        { icon: Calendar, label: 'Calendar & Meetings', href: '/calendar', visible: true },
        { icon: BookOpen, label: 'Knowledge Base', href: '/knowledge-base', badge: 'RAG', visible: true },
        { icon: FileText, label: 'Documents', href: '/documents', visible: hasPermission('documents.read') },
        { icon: MessageSquare, label: 'Team Chat', href: '/chat', visible: true },
      ].filter((i) => i.visible !== false),
    },
    {
      title: isSuperuser ? 'Enterprise Security' : 'Operations',
      badge: isSuperuser ? 'Admin' : (simulatedRole ? simulatedRole.name.split(' ')[0] : undefined),
      items: [
        ...(isSuperuser ? [
          { icon: Building2, label: 'Organization', href: '/organization', visible: hasPermission('organization.read') },
          { icon: Network, label: 'Org Hierarchy', href: '/organization/org-chart', badge: 'Tree', visible: true },
          { icon: Users, label: 'Employees', href: '/employees', visible: hasPermission('employees.read') },
          { icon: Shield, label: 'Roles & RBAC', href: '/roles', visible: hasPermission('roles.read') },
          { icon: KeyRound, label: 'Permissions', href: '/permissions', visible: hasPermission('permissions.read') },
        ] : [
          { icon: Users, label: 'Team Directory', href: '/employees', visible: hasPermission('employees.read') },
          { icon: Network, label: 'Org Hierarchy', href: '/organization/org-chart', visible: true },
          ...(hasPermission('organization.read') ? [{ icon: Building2, label: 'Organization', href: '/organization' }] : []),
        ]),
        { icon: Layers, label: 'RBAC Sandbox', href: '/rbac-simulator', badge: 'Sim' },
        { icon: GitBranch, label: 'Workflows', href: '/workflows' },
      ].filter((i) => i.visible !== false),
    },
    {
      title: 'Insights & System',
      items: [
        { icon: BarChart3, label: 'Analytics', href: '/analytics' },
        { icon: Activity, label: 'System Health', href: '/settings/diagnostics', badge: 'Live' },
        { icon: Bell, label: 'Notifications', href: '/notifications' },
        { icon: Settings, label: 'Settings', href: '/settings' },
      ],
    },
  ]

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) return true
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-xl border border-[#E2E8F0] dark:border-[#202F54] bg-white/90 dark:bg-[#0E1733]/90 p-2.5 text-[#0F172A] dark:text-slate-100 shadow-md backdrop-blur-md lg:hidden"
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
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
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
        className={`fixed left-0 top-0 z-40 h-screen flex-col border-r border-[#E2E8F0] dark:border-[#202F54] bg-white dark:bg-[#0E1733] shadow-xl shadow-sky-950/5 lg:flex transition-colors ${
          isOpen ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Logo Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#E2E8F0] dark:border-[#202F54] px-4 bg-white dark:bg-[#0E1733] transition-colors">
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <BusinessOSLogo size={30} showWordmark={isOpen} />
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden rounded-lg p-1.5 text-[#64748B] dark:text-slate-400 hover:bg-[#F0F7FF] dark:hover:bg-slate-800 hover:text-[#0284C7] dark:hover:text-sky-400 transition-all lg:flex cursor-pointer"
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
              className="flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] dark:border-[#202F54] bg-[#F8FAFC] dark:bg-[#131E3A] px-3 py-2 text-xs text-[#64748B] dark:text-slate-400 transition-all hover:border-[#0284C7]/60 hover:bg-[#F0F7FF] dark:hover:bg-slate-800 hover:text-[#0284C7] dark:hover:text-sky-400 cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Search size={14} className="text-[#64748B] dark:text-slate-400" />
                <span className="font-medium">Search anything...</span>
              </div>
              <kbd className="rounded border border-[#E2E8F0] dark:border-[#202F54] bg-white dark:bg-[#0E1733] px-1.5 py-0.5 text-[10px] font-semibold text-[#64748B] dark:text-slate-400">Ctrl+K</kbd>
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {isOpen && (
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    {section.title}
                  </h3>
                  {section.badge && (
                    <span className="rounded bg-[#E0F2FE] dark:bg-sky-950/70 px-1.5 py-0.2 text-[9px] font-bold text-[#0284C7] dark:text-sky-400 uppercase">
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
                      prefetch={true}
                      title={!isOpen ? item.label : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? 'bg-[#E0F2FE] dark:bg-sky-950/70 text-[#0284C7] dark:text-sky-300 font-bold shadow-xs border border-[#BAE6FD] dark:border-sky-800/60'
                          : 'text-[#475569] dark:text-slate-300 hover:bg-[#F0F7FF] dark:hover:bg-slate-800/70 hover:text-[#0284C7] dark:hover:text-sky-400'
                      }`}
                    >
                      <Icon
                        size={18}
                        className={`shrink-0 transition-colors ${
                          active ? 'text-[#0284C7] dark:text-sky-400' : 'text-[#64748B] dark:text-slate-400 group-hover:text-[#0284C7] dark:group-hover:text-sky-400'
                        }`}
                      />
                      {isOpen && (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}
                      {isOpen && item.badge && (
                        <span className="rounded-full bg-[#E0F2FE] dark:bg-sky-950 px-2 py-0.5 text-[10px] font-bold text-[#0284C7] dark:text-sky-400">
                          {item.badge}
                        </span>
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
              className="mx-3 mb-2 rounded-2xl border border-[#BAE6FD] dark:border-[#202F54] bg-white dark:bg-[#131E3A] p-3 shadow-2xl space-y-2 z-50 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between pb-1 border-b border-[#E2E8F0] dark:border-[#202F54] text-xs font-semibold text-[#475569] dark:text-slate-300">
                <span>RBAC Simulation Personas</span>
                {simulatedRole && (
                  <button
                    onClick={() => {
                      resetSimulation()
                      setShowRoleSwitcher(false)
                    }}
                    className="text-[10px] text-rose-500 font-bold hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              {PRESET_SIMULATED_ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSimulatedRole(role)
                    setShowRoleSwitcher(false)
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#F0F7FF] dark:hover:bg-slate-800 transition-colors flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>{role.avatar}</span>
                    <div>
                      <p className="font-bold text-[#0F172A] dark:text-slate-100">{role.name}</p>
                      <p className="text-[10px] text-[#64748B] dark:text-slate-400 truncate max-w-[140px]">{role.tagline}</p>
                    </div>
                  </div>
                  {simulatedRole?.id === role.id && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Footer Profile Card */}
        <div className="shrink-0 border-t border-[#E2E8F0] dark:border-[#202F54] p-3 bg-white dark:bg-[#0E1733] transition-colors">
          <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] dark:bg-[#131E3A] p-2 border border-[#E2E8F0] dark:border-[#202F54]">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex flex-1 items-center gap-2.5 overflow-hidden text-left group cursor-pointer"
              title="Click to switch simulated role"
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0284C7] text-white font-bold text-xs">
                {simulatedRole ? simulatedRole.avatar : (user?.first_name ? user.first_name[0] : 'M')}
                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-800 ${simulatedRole ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              </div>
              {isOpen && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="truncate text-xs font-bold text-[#0F172A] dark:text-slate-100 group-hover:text-[#0284C7] dark:group-hover:text-sky-400 transition-colors flex items-center gap-1">
                    {simulatedRole ? simulatedRole.name : (user ? `${user.first_name} ${user.last_name}` : 'Milan Rathod')}
                    <ChevronDown size={12} className="text-[#64748B] dark:text-slate-400" />
                  </p>
                  <p className="truncate text-[10px] text-[#64748B] dark:text-slate-400 font-medium">
                    {simulatedRole ? 'Simulated Persona' : (isSuperuser ? 'System Admin' : 'Workspace Member')}
                  </p>
                </div>
              )}
            </button>

            {isOpen && (
              <button
                onClick={logout}
                title="Sign Out"
                className="ml-1 rounded-lg p-1.5 text-[#64748B] dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors cursor-pointer"
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
