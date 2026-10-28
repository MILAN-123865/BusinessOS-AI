'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  MessageSquare,
  Sparkles,
  DollarSign,
  Package,
  ShieldAlert,
  GitMerge,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'order' | 'inventory' | 'security' | 'task' | 'ai'
  timestamp: string
  read: boolean
  link?: string
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'High-Value Order Received',
    message: 'Order #10248 from Alfreds Futterkiste placed ($1,440.00). AI stock validation passed.',
    type: 'order',
    timestamp: '5 mins ago',
    read: false,
    link: '/finance',
  },
  {
    id: 'notif-2',
    title: '⚠️ Low-Stock Inventory Warning',
    message: 'SKU NW-PROD-017 (Alice Mutton) is at 12 units. AI reorder draft prepared.',
    type: 'inventory',
    timestamp: '25 mins ago',
    read: false,
    link: '/workflows',
  },
  {
    id: 'notif-3',
    title: 'Autonomous Task Created',
    message: 'Task "Follow up with European distribution partners" created by BusinessOS AI Copilot.',
    type: 'ai',
    timestamp: '1 hour ago',
    read: false,
    link: '/tasks',
  },
  {
    id: 'notif-4',
    title: 'RBAC Policy Simulation Audit',
    message: 'Simulated persona "Sales Executive" evaluated against roles.manage (403 Blocked).',
    type: 'security',
    timestamp: '2 hours ago',
    read: true,
    link: '/rbac-simulator',
  },
]

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <DollarSign size={15} />
          </div>
        )
      case 'inventory':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <Package size={15} />
          </div>
        )
      case 'security':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
            <ShieldAlert size={15} />
          </div>
        )
      case 'ai':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Sparkles size={15} />
          </div>
        )
      default:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <Info size={15} />
          </div>
        )
    }
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer shadow-xs"
        title="Notifications & Live Alerts"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-transparent"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-sky-100 dark:border-sky-900 bg-white dark:bg-[#0B132B] shadow-2xl overflow-hidden backdrop-blur-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-sky-100 dark:border-sky-950 px-4 py-3 bg-sky-50/50 dark:bg-[#070D1E]">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Live Workspace Alerts</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-sky-600 px-2 py-0.2 text-[9px] font-bold text-white">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No new notifications. Everything is running smoothly!
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMarkAsRead(item.id)}
                      className={`group flex items-start justify-between gap-3 p-3 rounded-xl transition-all ${
                        !item.read
                          ? 'bg-sky-50/60 dark:bg-sky-950/40 hover:bg-sky-50 dark:hover:bg-sky-950/60'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        {getIcon(item.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {item.title}
                            </h4>
                            {!item.read && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                          <div className="flex items-center justify-between mt-2 text-[10px]">
                            <span className="text-slate-400">{item.timestamp}</span>
                            {item.link && (
                              <Link
                                href={item.link}
                                onClick={() => setIsOpen(false)}
                                className="font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                              >
                                <span>Inspect</span>
                                <ExternalLink size={9} />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                        title="Dismiss"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-sky-100 dark:border-sky-950 bg-slate-50 dark:bg-[#070D1E] p-2 text-center">
                <Link
                  href="/settings/audit-logs"
                  onClick={() => setIsOpen(false)}
                  className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
                >
                  View Full Compliance Audit Ledger →
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
