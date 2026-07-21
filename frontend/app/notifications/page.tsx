'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  MessageSquare,
  Settings,
  Trash2,
  Check,
  Search
} from 'lucide-react'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useNotificationPreferences,
  useUpdateNotificationPreferences
} from '@/hooks/useNotifications'
import { Notification, NotificationType } from '@/types/notification'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const getIcon = (type: string) => {
  switch (type) {
    case 'Task Completed':
    case 'Leave Approved': 
      return <CheckCircle2 size={24} className="text-emerald-400" />
    case 'Security Alerts':
    case 'Leave Rejected':
      return <AlertCircle size={24} className="text-amber-400" />
    case 'System Alerts':
    case 'Broadcast':
      return <Info size={24} className="text-blue-400" />
    case 'Comment Added':
    case 'Task Assigned':
    case 'Document Shared':
      return <MessageSquare size={24} className="text-accent" />
    default: 
      return <Bell size={24} className="text-muted-foreground" />
  }
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'preferences'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: notificationsData, isLoading } = useNotifications({
    limit: 50,
    search: searchQuery,
    is_read: activeTab === 'unread' ? false : undefined
  })
  const { data: preferences, isLoading: prefsLoading } = useNotificationPreferences()

  const markAsRead = useMarkNotificationRead()
  const markAllAsRead = useMarkAllNotificationsRead()
  const deleteNotification = useDeleteNotification()
  const updatePrefs = useUpdateNotificationPreferences()

  const notifications = notificationsData?.notifications || []

  const handleTogglePref = (key: keyof typeof preferences) => {
    if (!preferences) return
    updatePrefs.mutate({ [key]: !preferences[key] })
  }

  const handleMuteType = (type: NotificationType) => {
    if (!preferences) return
    const muted = preferences.muted_types || []
    const isMuted = muted.includes(type)
    updatePrefs.mutate({
      muted_types: isMuted 
        ? muted.filter(t => t !== type) 
        : [...muted, type]
    })
  }

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Notification Center</h1>
            <p className="mt-2 text-muted-foreground">Manage your alerts and notification preferences.</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-card/40 p-1 border border-border/40 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'all' ? 'bg-primary/20 text-accent' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'unread' ? 'bg-primary/20 text-accent' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'preferences' ? 'bg-primary/20 text-accent' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings size={16} />
              Preferences
            </button>
          </div>
        </div>

        {activeTab !== 'preferences' ? (
          <Card className="border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-border/40 p-6 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border/40 bg-background/50 py-2 pl-10 pr-4 text-sm outline-none focus:border-accent"
                />
              </div>
              <button
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending || notifications.length === 0}
                className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-accent transition-all hover:bg-primary/20 disabled:opacity-50"
              >
                <Check size={16} />
                Mark all as read
              </button>
            </div>
            
            <div className="p-0">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
                  <Bell size={48} className="opacity-20" />
                  <p>No notifications found.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/20">
                  <AnimatePresence>
                    {notifications.map((notification, idx) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`group flex items-start gap-4 p-6 transition-colors hover:bg-card/40 ${
                          !notification.is_read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card border border-border/40">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="font-semibold text-foreground">{notification.title}</h4>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          {notification.link_url && (
                            <a
                              href={notification.link_url}
                              className="inline-block mt-2 text-sm font-medium text-accent hover:underline"
                            >
                              View Details &rarr;
                            </a>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead.mutate(notification.id)}
                              className="rounded-lg p-2 text-muted-foreground hover:bg-card hover:text-emerald-400 transition-colors"
                              title="Mark as read"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification.mutate(notification.id)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-card hover:text-destructive transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="border-border/40 bg-card/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Delivery Preferences</CardTitle>
              <CardDescription>Choose how and when you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {prefsLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    {[
                      { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive summaries and critical alerts via email.' },
                      { key: 'push_notifications', label: 'Push Notifications', desc: 'Browser push notifications when active.' },
                      { key: 'sms_notifications', label: 'SMS Notifications', desc: 'Text messages for high priority alerts.' },
                      { key: 'in_app_notifications', label: 'In-App Alerts', desc: 'Show badges and toast notifications inside the app.' }
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between rounded-xl border border-border/40 bg-card/40 p-4">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={preferences?.[key as keyof typeof preferences] as boolean}
                            onChange={() => handleTogglePref(key as keyof typeof preferences)}
                          />
                          <div className="peer h-6 w-11 rounded-full bg-border/40 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Mute Specific Types</h4>
                    <p className="text-sm text-muted-foreground">Select notification types you DO NOT want to receive.</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Task Assigned', 'Task Updated', 'Task Completed', 'Project Updated', 
                        'Meeting Reminder', 'Document Shared', 'Asset Assigned', 'Leave Approved', 
                        'Leave Rejected', 'Comment Added', 'Client Activity'
                      ].map((type) => {
                        const isMuted = preferences?.muted_types?.includes(type as NotificationType)
                        return (
                          <Badge
                            key={type}
                            onClick={() => handleMuteType(type as NotificationType)}
                            className={`cursor-pointer border px-3 py-1.5 transition-all ${
                              isMuted
                                ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                                : 'bg-card text-muted-foreground border-border/40 hover:bg-card/80'
                            }`}
                          >
                            {type} {isMuted && '(Muted)'}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
