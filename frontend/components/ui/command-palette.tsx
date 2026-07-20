'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, FolderOpen, CheckSquare, Users, Hash, Briefcase, Clock, FileText, Monitor, MessageSquare, BarChart, ExternalLink } from 'lucide-react'
import { useGlobalSearch, useRecentSearches, useClearRecentSearches } from '@/hooks/useSearch'
import { SearchResult, SearchEntityType } from '@/types/search'
import { useRouter } from 'next/navigation'

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()

  const { data: searchData, isLoading } = useGlobalSearch(query)
  const { data: recentSearches } = useRecentSearches()
  const clearRecent = useClearRecentSearches()

  const results = searchData?.results || []

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Reset query when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setQuery(''), 200)
    }
  }, [isOpen])

  // Expose function globally so Navbar button can open it
  useEffect(() => {
    // @ts-ignore
    window.openCommandPalette = () => setIsOpen(true)
    return () => {
      // @ts-ignore
      delete window.openCommandPalette
    }
  }, [])

  const getEntityIcon = (type: SearchEntityType) => {
    switch (type) {
      case 'project': return <FolderOpen size={16} className="text-amber-400" />
      case 'task': return <CheckSquare size={16} className="text-emerald-400" />
      case 'employee': return <Users size={16} className="text-blue-400" />
      case 'department': return <Hash size={16} className="text-purple-400" />
      case 'client': return <Briefcase size={16} className="text-orange-400" />
      case 'meeting': return <Clock size={16} className="text-pink-400" />
      case 'asset': return <Monitor size={16} className="text-cyan-400" />
      case 'document': return <FileText size={16} className="text-stone-400" />
      case 'chat': return <MessageSquare size={16} className="text-accent" />
      case 'report': return <BarChart size={16} className="text-indigo-400" />
      default: return <Search size={16} className="text-muted-foreground" />
    }
  }

  const handleSelect = (url: string) => {
    setIsOpen(false)
    router.push(url)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-1/2 top-[10%] z-50 w-full max-w-2xl -translate-x-1/2 overflow-hidden rounded-xl border border-border/40 bg-card shadow-2xl"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b border-border/40 px-4 py-4">
              <Search size={20} className="text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search across the enterprise... (e.g. 'Q3 Planning')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground/70"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-primary/20 hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query.length > 0 && query.length < 2 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Type at least 2 characters to search...
                </div>
              ) : isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                </div>
              ) : query.length >= 2 && results.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Search size={40} className="mx-auto mb-4 opacity-20" />
                  <p>No results found for "{query}"</p>
                </div>
              ) : query.length >= 2 ? (
                <div className="space-y-1">
                  <div className="px-3 pb-2 pt-4 text-xs font-semibold uppercase text-muted-foreground">
                    Search Results
                  </div>
                  {results.map((result: SearchResult) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result.url)}
                      className="group flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition-colors hover:bg-primary/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-background/50 border border-border/40 group-hover:bg-background">
                          {getEntityIcon(result.type)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                            {result.title}
                          </p>
                          {(result.subtitle || result.description) && (
                            <p className="text-xs text-muted-foreground truncate max-w-sm">
                              {result.subtitle ? `${result.subtitle} • ` : ''}{result.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {recentSearches && recentSearches.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between px-3 pb-2 pt-2">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">Recent Searches</span>
                        <button 
                          onClick={() => clearRecent.mutate()}
                          className="text-xs text-muted-foreground hover:text-accent transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      {recentSearches.map((recent) => (
                        <button
                          key={recent.id}
                          onClick={() => setQuery(recent.query)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                        >
                          <Search size={14} className="opacity-50" />
                          <span>{recent.query}</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      Search for projects, tasks, employees, documents, and more.
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border/40 bg-card/40 px-4 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border/60 bg-background/50 px-1 font-mono text-[10px]">↑</kbd>
                  <kbd className="rounded border border-border/60 bg-background/50 px-1 font-mono text-[10px]">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border/60 bg-background/50 px-1 font-mono text-[10px]">Enter</kbd>
                  to select
                </span>
              </div>
              <span>
                <kbd className="rounded border border-border/60 bg-background/50 px-1 font-mono text-[10px]">Esc</kbd>
                to close
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
