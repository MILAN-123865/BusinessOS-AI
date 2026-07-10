'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Save, Bell, Lock, Palette, User } from 'lucide-react'
import { useState } from 'react'

const settingsGroups = [
  {
    icon: User,
    title: 'Profile',
    description: 'Manage your personal information',
    href: '#profile',
  },
  {
    icon: Palette,
    title: 'Appearance',
    description: 'Customize the look and feel',
    href: '#appearance',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Control how you get notified',
    href: '#notifications',
  },
  {
    icon: Lock,
    title: 'Security',
    description: 'Manage passwords and authentication',
    href: '#security',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 max-w-6xl"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
          <p className="mt-2 text-muted-foreground">Manage your account and preferences</p>
        </motion.div>

        {/* Settings Layout */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-0">
                <div className="space-y-1">
                  {settingsGroups.map((group) => (
                    <motion.button
                      key={group.title}
                      whileHover={{ x: 4 }}
                      onClick={() => setActiveTab(group.title.toLowerCase())}
                      className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                        activeTab === group.title.toLowerCase()
                          ? 'bg-primary/10 text-accent'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <group.icon size={20} />
                      <span className="font-medium">{group.title}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Full Name</label>
                      <input type="text" defaultValue="Admin User" className="mt-1 w-full rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-sm outline-none focus:border-accent" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <input type="email" defaultValue="admin@businessos.ai" className="mt-1 w-full rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-sm outline-none focus:border-accent" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Department</label>
                      <input type="text" defaultValue="Leadership" className="mt-1 w-full rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-sm outline-none focus:border-accent" />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2 font-medium text-accent hover:bg-primary/30"
                    >
                      <Save size={18} />
                      Save Changes
                    </motion.button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>Choose your preferred color scheme</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        { name: 'Dark', value: 'dark', color: 'bg-slate-900' },
                        { name: 'Light', value: 'light', color: 'bg-white' },
                        { name: 'System', value: 'system', color: 'bg-gradient-to-r from-slate-900 to-white' },
                      ].map((theme) => (
                        <motion.button
                          key={theme.value}
                          whileHover={{ scale: 1.02 }}
                          className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                            activeTab === 'appearance' ? 'border-accent' : 'border-border/40'
                          }`}
                        >
                          <div className={`h-20 w-full rounded-lg ${theme.color}`} />
                          <span className="font-medium">{theme.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'Email Notifications', description: 'Receive updates via email' },
                      { label: 'Push Notifications', description: 'Get browser push notifications' },
                      { label: 'Task Reminders', description: 'Be reminded about pending tasks' },
                      { label: 'Team Updates', description: 'Notifications about team activity' },
                    ].map((notif, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg border border-border/40 bg-card/40 p-4">
                        <div>
                          <p className="font-medium">{notif.label}</p>
                          <p className="text-sm text-muted-foreground">{notif.description}</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border/40" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border border-border/40 bg-card/40 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Password</p>
                          <p className="text-sm text-muted-foreground">Last changed 2 months ago</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          className="rounded-lg border border-border/40 px-3 py-1.5 text-sm hover:bg-card/60"
                        >
                          Change
                        </motion.button>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/40 bg-card/40 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">Not enabled</p>
                        </div>
                        <Badge variant="outline">Disabled</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  )
}
