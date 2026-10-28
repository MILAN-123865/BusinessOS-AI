'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  X, 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  FileText, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Settings, 
  Bot, 
  Plus, 
  LogOut
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  category: 'Recent' | 'Navigation' | 'Projects' | 'Tasks' | 'Documents' | 'Actions'
  icon: any
  action: () => void
  shortcut?: string
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Define static command registry
  const allCommands: CommandItem[] = [
    // Actions
    {
      id: 'act-create-task',
      title: 'Create Task',
      subtitle: 'Open task creation modal',
      category: 'Actions',
      icon: Plus,
      shortcut: '⌘ T',
      action: () => {
        setIsOpen(false)
        router.push('/tasks')
      },
    },
    {
      id: 'act-create-project',
      title: 'Create Project',
      subtitle: 'Initialize new project workspace',
      category: 'Actions',
      icon: FolderOpen,
      action: () => {
        setIsOpen(false)
        router.push('/projects')
      },
    },
    {
      id: 'act-ai-copilot',
      title: 'Open Executive AI Copilot',
      subtitle: 'Ask AI assistant for telemetry analysis',
      category: 'Actions',
      icon: Bot,
      shortcut: '⌘ AI',
      action: () => {
        setIsOpen(false)
        router.push('/ai-assistant')
      },
    },
    {
      id: 'act-logout',
      title: 'Sign Out',
      subtitle: 'End current session safely',
      category: 'Actions',
      icon: LogOut,
      action: () => {
        setIsOpen(false)
        clearAuth()
        router.push('/login')
      },
    },

    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Dashboard Overview',
      subtitle: 'Executive metrics telemetry',
      category: 'Navigation',
      icon: LayoutDashboard,
      shortcut: 'G D',
      action: () => {
        setIsOpen(false)
        router.push('/dashboard')
      },
    },
    {
      id: 'nav-projects',
      title: 'Projects Workspace',
      subtitle: 'Active project boards',
      category: 'Navigation',
      shortcut: 'G P',
      icon: FolderOpen,
      action: () => {
        setIsOpen(false)
        router.push('/projects')
      },
    },
    {
      id: 'nav-tasks',
      title: 'Tasks & Kanban',
      subtitle: 'Cross-functional sprint tasks',
      category: 'Navigation',
      icon: CheckSquare,
      action: () => {
        setIsOpen(false)
        router.push('/tasks')
      },
    },
    {
      id: 'nav-documents',
      title: 'Document Management',
      subtitle: 'Centralized strategy & docs',
      category: 'Navigation',
      icon: FileText,
      action: () => {
        setIsOpen(false)
        router.push('/documents')
      },
    },
    {
      id: 'nav-calendar',
      title: 'Calendar & Meetings',
      subtitle: 'Executive schedules',
      category: 'Navigation',
      icon: Calendar,
      action: () => {
        setIsOpen(false)
        router.push('/calendar')
      },
    },
    {
      id: 'nav-employees',
      title: 'Employee Directory',
      subtitle: 'Organization members',
      category: 'Navigation',
      icon: Users,
      action: () => {
        setIsOpen(false)
        router.push('/employees')
      },
    },
    {
      id: 'nav-roles',
      title: 'Roles & RBAC',
      subtitle: 'Permissions and access governance',
      category: 'Navigation',
      icon: ShieldCheck,
      action: () => {
        setIsOpen(false)
        router.push('/roles')
      },
    },
    {
      id: 'nav-settings',
      title: 'Organization Settings',
      subtitle: 'System configurations',
      category: 'Navigation',
      icon: Settings,
      action: () => {
        setIsOpen(false)
        router.push('/settings')
      },
    },

    // Projects
    {
      id: 'proj-1',
      title: 'Website Redesign',
      subtitle: 'Marketing & Design • In Progress',
      category: 'Projects',
      icon: FolderOpen,
      action: () => {
        setIsOpen(false)
        router.push('/projects')
      },
    },
    {
      id: 'proj-2',
      title: 'Mobile App v2',
      subtitle: 'Engineering • Planning Phase',
      category: 'Projects',
      icon: FolderOpen,
      action: () => {
        setIsOpen(false)
        router.push('/projects')
      },
    },

    // Tasks
    {
      id: 'task-1',
      title: 'Prepare Q4 Financial Audit Report',
      subtitle: 'Finance Dept • Due Oct 12',
      category: 'Tasks',
      icon: CheckSquare,
      action: () => {
        setIsOpen(false)
        router.push('/tasks')
      },
    },
    {
      id: 'task-2',
      title: 'Review Stripe Webhook API Integration',
      subtitle: 'SecOps • High Priority',
      category: 'Tasks',
      icon: CheckSquare,
      action: () => {
        setIsOpen(false)
        router.push('/tasks')
      },
    },

    // Documents
    {
      id: 'doc-1',
      title: 'Q4 Enterprise Strategy Manifesto',
      subtitle: 'Updated 2 hours ago by Milan R.',
      category: 'Documents',
      icon: FileText,
      action: () => {
        setIsOpen(false)
        router.push('/documents')
      },
    },
    {
      id: 'doc-2',
      title: 'Annual Operating Budget 2026',
      subtitle: 'Financial Planning • PDF',
      category: 'Documents',
      icon: FileText,
      action: () => {
        setIsOpen(false)
        router.push('/documents')
      },
    },
  ]

  // Filter commands by search query
  const filteredCommands = allCommands.filter((cmd) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    )
  })

  // Global Ctrl+K Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) {
          closePalette()
        } else {
          openPalette()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Global window trigger
  useEffect(() => {
    ;(window as any).openCommandPalette = openPalette
    return () => {
      delete (window as any).openCommandPalette
    }
  }, [])

  const openPalette = () => {
    previousFocusRef.current = document.activeElement as HTMLElement
    setIsOpen(true)
    setQuery('')
    setSelectedIndex(0)
  }

  const closePalette = () => {
    setIsOpen(false)
    if (previousFocusRef.current) {
      previousFocusRef.current.focus()
    }
  }

  // Keyboard navigation within modal
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      closePalette()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={closePalette}
            className="fixed inset-0 z-50 bg-[#070B14]/80 backdrop-blur-sm"
          />

          {/* Centered Command Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-[#1E2638] bg-[#0B1020] shadow-2xl text-[#F7F8FC]"
          >
            {/* Input Bar */}
            <div className="flex items-center gap-3 border-b border-[#1E2638] px-4 py-3 bg-[#070B14]">
              <Search className="h-4 w-4 text-[#737B8F]" />
              <input
                ref={inputRef}
                autoFocus
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Search BusinessOS workspace..."
                className="flex-1 bg-transparent text-sm text-[#F7F8FC] placeholder-[#737B8F] outline-none"
              />
              <button
                onClick={closePalette}
                className="rounded-md p-1 text-[#737B8F] hover:bg-[#1E2638] hover:text-[#F7F8FC]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Command List Container */}
            <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#737B8F]">
                  No matching workspace actions or routes for "{query}"
                </div>
              ) : (
                filteredCommands.map((item, idx) => {
                  const isSelected = idx === selectedIndex
                  const IconComp = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-[#5B5CE2]/20 text-[#F7F8FC] border border-[#5B5CE2]/30'
                          : 'text-[#A7AEC0] border border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <IconComp className={`h-4 w-4 shrink-0 ${isSelected ? 'text-[#5B5CE2]' : 'text-[#737B8F]'}`} />
                        <div className="truncate">
                          <p className="font-medium text-[#F7F8FC]">{item.title}</p>
                          {item.subtitle && (
                            <p className="text-[11px] text-[#737B8F] truncate">{item.subtitle}</p>
                          )}
                        </div>
                      </div>

                      {item.shortcut && (
                        <kbd className="font-mono text-[10px] text-[#737B8F] border border-[#1E2638] bg-[#070B14] px-1.5 py-0.5 rounded">
                          {item.shortcut}
                        </kbd>
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* Keyboard Footer */}
            <div className="flex items-center justify-between border-t border-[#1E2638] bg-[#070B14] px-4 py-2 text-[11px] text-[#737B8F]">
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>↵ Open</span>
              </div>
              <span>Esc Close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
