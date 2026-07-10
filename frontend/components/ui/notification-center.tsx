'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, CheckCircle2, AlertCircle, Info, MessageSquare } from 'lucide-react'
import { Badge } from './badge'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'message'
  title: string
  description: string
  timestamp: string
  read: boolean
}

const notifications: Notification[] = [
  { id: '1', type: 'success', title: 'Project Completed', description: 'Q3 Marketing Campaign is now complete', timestamp: '2 hours ago', read: false },
  { id: '2', type: 'warning', title: 'Budget Alert', description: 'Team budget is 80% utilized for this month', timestamp: '4 hours ago', read: false },
  { id: '3', type: 'info', title: 'New Team Member', description: 'Jordan has joined the Design team', timestamp: '1 day ago', read: true },
  { id: '4', type: 'message', title: 'Message from Sarah', description: 'Can you review the latest design?', timestamp: '2 days ago', read: true },
]

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState(notifications)

  const unreadCount = items.filter(n => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setItems(items.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const handleMarkAllAsRead = () => {
    setItems(items.map(n => ({ ...n, read: true })))
  }

  const handleDelete = (id: string) => {
    setItems(items.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={20} className="text-emerald-400" />
      case 'warning': return <AlertCircle size={20} className="text-amber-400" />
      case 'info': return <Info size={20} className="text-blue-400" />
      case 'message': return <MessageSquare size={20} className="text-accent" />
      default: return <Bell size={20} />
    }
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 hover:bg-card/40"
      >
        <Bell size={20} className="text-muted-foreground" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-0 top-0 h-2 w-2 rounded-full bg-destructive/80"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-12 z-50 w-96 max-w-lg rounded-lg border border-border/40 bg-card shadow-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-accent hover:text-accent/80"
                  >
                    Mark all as read
                  </motion.button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {items.length > 0 ? (
                  items.map((notification, idx) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: idx * 0.02, duration: 0.12 }}
                      whileHover={{ x: 2, backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                      whileTap={{ x: 1 }}
                      onClick={() => handleMarkAsRead(notification.id)}
                      className={`flex gap-3 border-b border-border/20 p-4 cursor-pointer transition-colors group ${
                        notification.read ? 'bg-card/40' : 'bg-primary/5'
                      } hover:bg-primary/10`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium">{notification.title}</p>
                          {!notification.read && (
                            <div className="flex-shrink-0 h-2 w-2 rounded-full bg-accent mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{notification.description}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">{notification.timestamp}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(notification.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <X size={16} />
                      </motion.button>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex h-32 items-center justify-center text-muted-foreground">
                    All caught up!
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-border/40 px-4 py-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full text-center text-sm text-accent hover:text-accent/80"
                  >
                    View all notifications
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
