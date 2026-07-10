'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Command, Search, Grid3x3, Users, FolderOpen, Building2, FileText, BarChart3, Plus, Zap, Settings } from 'lucide-react'

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const commands = [
    { icon: Grid3x3, label: 'Dashboard', description: 'Go to dashboard' },
    { icon: Users, label: 'Employees', description: 'View team members' },
    { icon: FolderOpen, label: 'Projects', description: 'Manage projects' },
    { icon: Building2, label: 'Clients', description: 'View clients' },
    { icon: FileText, label: 'Documents', description: 'Access documents' },
    { icon: BarChart3, label: 'Analytics', description: 'View analytics' },
    { icon: Plus, label: 'Create New Project', description: 'Start a new project' },
    { icon: Zap, label: 'AI Assistant', description: 'Chat with AI' },
    { icon: Settings, label: 'Settings', description: 'Manage settings' },
  ]

  const filtered = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-1/4 z-50 w-full max-w-lg -translate-x-1/2 rounded-lg border border-border/40 bg-card/95 shadow-2xl backdrop-blur-sm"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b border-border/40 px-4 py-4">
              <Search size={20} className="text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search commands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-lg outline-none placeholder-muted-foreground"
              />
            </div>

            {/* Commands List */}
            <div className="max-h-96 overflow-y-auto">
              {filtered.length > 0 ? (
                filtered.map((cmd, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.01, duration: 0.15 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                    whileTap={{ x: 2 }}
                    onClick={() => {
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className="group flex w-full items-center gap-4 border-b border-border/20 px-4 py-3 text-left hover:bg-primary/10 transition-colors"
                  >
                    <cmd.icon size={20} className="text-muted-foreground group-hover:text-accent" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{cmd.label}</p>
                      <p className="text-sm text-muted-foreground truncate">{cmd.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">⌘↵</span>
                  </motion.button>
                ))
              ) : (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No commands found
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border/40 px-4 py-3 text-xs text-muted-foreground flex items-center justify-between">
              <span>Press <kbd className="rounded bg-card/40 px-2 py-1">ESC</kbd> to close</span>
              <span className="flex items-center gap-1"><Command size={14} /> K to open</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
