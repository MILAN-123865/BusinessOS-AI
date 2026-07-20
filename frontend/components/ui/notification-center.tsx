'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, CheckCircle2, AlertCircle, Info, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification, useUnreadNotificationsCount } from '@/hooks/useNotifications'
import { Notification } from '@/types/notification'
import { formatDistanceToNow } from 'date-fns'

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  
  // Real API hooks
  const { data: notificationsData, isLoading } = useNotifications({ limit: 10 })
  const { data: unreadCount = 0 } = useUnreadNotificationsCount()
  const markAsReadMutation = useMarkNotificationRead()
  const markAllAsReadMutation = useMarkAllNotificationsRead()
  const deleteNotificationMutation = useDeleteNotification()

  const items: Notification[] = notificationsData?.notifications || []

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const handleDelete = (id: string) => {
    deleteNotificationMutation.mutate(id)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'Task Completed':
      case 'Leave Approved': 
        return <CheckCircle2 size={20} className="text-emerald-400" />
      case 'Security Alerts':
      case 'Leave Rejected':
        return <AlertCircle size={20} className="text-amber-400" />
      case 'System Alerts':
      case 'Broadcast':
        return <Info size={20} className="text-blue-400" />
      case 'Comment Added':
      case 'Task Assigned':
      case 'Document Shared':
        return <MessageSquare size={20} className="text-accent" />
      default: 
        return <Bell size={20} />
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
            className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
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
                    disabled={markAllAsReadMutation.isPending}
                    className="text-xs text-accent hover:text-accent/80 disabled:opacity-50"
                  >
                    Mark all as read
                  </motion.button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                   <div className="flex h-32 items-center justify-center text-muted-foreground">
                    Loading notifications...
                  </div>
                ) : items.length > 0 ? (
                  items.map((notification, idx) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: idx * 0.02, duration: 0.12 }}
                      whileHover={{ x: 2, backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                      whileTap={{ x: 1 }}
                      onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                      className={`group relative flex cursor-pointer gap-3 border-b border-border/20 p-4 transition-colors ${
                        notification.is_read ? 'bg-card/40' : 'bg-primary/5'
                      } hover:bg-primary/10`}
                    >
                      <div className="mt-1 flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm">{notification.title}</p>
                          {!notification.is_read && (
                            <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                          )}
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{notification.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground/70">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(notification.id)
                        }}
                        disabled={deleteNotificationMutation.isPending}
                        className="absolute right-4 top-4 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 disabled:opacity-50"
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
              <div className="border-t border-border/40 px-4 py-3">
                <Link href="/notifications" onClick={() => setIsOpen(false)}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="w-full text-center text-sm text-accent hover:text-accent/80 cursor-pointer"
                  >
                    View all notifications
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

