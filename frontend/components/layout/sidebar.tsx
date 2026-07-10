'use client'

import { useState } from 'react'
import { ChevronRight, Menu, X, Settings, Bell, User, LogOut, Grid3x3, Users, FolderOpen, Building2, FileText, BarChart3, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
  badge?: number
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { icon: <Grid3x3 size={20} />, label: 'Dashboard', href: '/dashboard' },
      { icon: <Users size={20} />, label: 'Employees', href: '/employees' },
      { icon: <FolderOpen size={20} />, label: 'Projects', href: '/projects' },
      { icon: <Building2 size={20} />, label: 'Clients', href: '/clients' },
      { icon: <FileText size={20} />, label: 'Documents', href: '/documents' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { icon: <BarChart3 size={20} />, label: 'Analytics', href: '/analytics' },
    ],
  },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [isPinned, setIsPinned] = useState(false)

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-border/40 bg-card/80 p-2 backdrop-blur-sm lg:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 280 : 80,
          x: isOpen ? 0 : -280,
        }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
        className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border/40 bg-sidebar lg:flex"
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between border-b border-border/40 p-4">
          <motion.div
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <span className="text-lg font-bold text-accent">BusinessOS</span>
          </motion.div>
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg p-1.5 hover:bg-sidebar-accent/20"
          >
            <ChevronRight
              size={18}
              className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </motion.button>
        </div>

        {/* Search */}
        <div className="border-b border-border/40 p-3">
          <motion.div
            animate={{ opacity: isOpen ? 1 : 0 }}
            className={`rounded-lg border border-border/40 bg-card/40 p-2 ${isOpen ? '' : 'invisible'}`}
          >
            <Search size={16} className="text-muted-foreground" />
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              <motion.h3
                animate={{ opacity: isOpen ? 1 : 0 }}
                className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {section.title}
              </motion.h3>
              <ul className="mt-2 space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group relative mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-accent/10"
                    >
                      <span className="text-muted-foreground transition-colors group-hover:text-accent">
                        {item.icon}
                      </span>
                      <motion.span
                        animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
                        className="overflow-hidden"
                      >
                        {item.label}
                        {item.badge && (
                          <span className="ml-auto inline-flex items-center justify-center rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-semibold text-destructive">
                            {item.badge}
                          </span>
                        )}
                      </motion.span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-border/40 p-3">
          <div className="space-y-1">
            <button className="group relative mx-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-accent/10">
              <Bell size={20} className="text-muted-foreground transition-colors group-hover:text-accent" />
              <motion.span animate={{ opacity: isOpen ? 1 : 0 }}>Notifications</motion.span>
            </button>
            <button className="group relative mx-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-accent/10">
              <Settings size={20} className="text-muted-foreground transition-colors group-hover:text-accent" />
              <motion.span animate={{ opacity: isOpen ? 1 : 0 }}>Settings</motion.span>
            </button>
          </div>

          {/* User Profile */}
          <div className="mt-4 border-t border-border/40 pt-3">
            <button className="group relative mx-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-accent/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/30">
                <User size={16} className="text-accent" />
              </div>
              <motion.div animate={{ opacity: isOpen ? 1 : 0 }} className="flex-1 overflow-hidden text-left">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@businessos.ai</p>
              </motion.div>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Spacer */}
      <motion.div
        animate={{ marginLeft: isOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:block"
      />
    </>
  )
}
