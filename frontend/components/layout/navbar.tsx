'use client'

import { Search, CommandIcon, Plus, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { NotificationCenter } from '@/components/ui/notification-center'

export function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed top-0 right-0 left-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-sm lg:left-80"
    >
      <div className="flex h-16 items-center justify-between px-6 gap-4">
        {/* Left Section - Breadcrumb */}
        <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
          <span>Dashboard</span>
        </div>

        {/* Center Section - Search */}
        <motion.div
          animate={{
            flex: isSearchFocused ? 1 : 0.4,
            borderColor: isSearchFocused ? 'rgb(79, 70, 229)' : undefined,
          }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/40 px-4 py-2 backdrop-blur-sm transition-all"
        >
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search... (Ctrl+K)"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onClick={() => {
              // @ts-ignore
              if (window.openCommandPalette) window.openCommandPalette()
            }}
            readOnly
            className="w-full bg-transparent text-sm placeholder-muted-foreground outline-none cursor-pointer"
          />
        </motion.div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Command Palette Shortcut */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // @ts-ignore
              if (window.openCommandPalette) window.openCommandPalette()
            }}
            className="hidden items-center gap-2 rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-sm text-muted-foreground hover:text-foreground md:flex"
          >
            <CommandIcon size={16} />
            <span>Ctrl+K</span>
          </motion.button>

          {/* Quick Create */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg bg-primary/20 p-2 text-accent hover:bg-primary/30"
          >
            <Plus size={20} />
          </motion.button>

          {/* Notifications */}
          <NotificationCenter />

          {/* User Menu */}
          <Link
            href="/profile"
            title="My Profile"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/30 text-accent hover:bg-primary/40 transition-all hover:scale-105"
          >
            <User size={20} />
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
