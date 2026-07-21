'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSystemSettings, useUpdateSystemSettings } from '@/hooks/useSettings'
import { Settings, Shield, Bell, Zap, Save, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'features'>('general')
  
  const { data: settings, isLoading } = useSystemSettings()
  const updateSettingsMutation = useUpdateSystemSettings()

  const handleSave = (sectionData: any) => {
    updateSettingsMutation.mutate({
      [activeTab]: sectionData
    })
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-5xl space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your enterprise platform configurations and preferences.</p>
        </motion.div>

        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
            <Loader2 size={32} className="animate-spin text-accent mb-4" />
            <p>Loading settings...</p>
          </div>
        ) : !settings ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 text-destructive">
            <p className="font-semibold">Failed to load settings.</p>
          </div>
        ) : (
          <motion.div variants={itemVariants} className="flex flex-col gap-6 lg:flex-row">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 shrink-0">
              <nav className="flex space-x-2 overflow-x-auto pb-4 lg:flex-col lg:space-x-0 lg:space-y-1 lg:pb-0">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === 'general' ? 'bg-primary/20 text-accent' : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
                  }`}
                >
                  <Settings size={18} /> General
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === 'security' ? 'bg-primary/20 text-accent' : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
                  }`}
                >
                  <Shield size={18} /> Security
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === 'notifications' ? 'bg-primary/20 text-accent' : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
                  }`}
                >
                  <Bell size={18} /> Notifications
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === 'features' ? 'bg-primary/20 text-accent' : 'text-muted-foreground hover:bg-card/60 hover:text-foreground'
                  }`}
                >
                  <Zap size={18} /> Features
                </button>
              </nav>
            </aside>

            {/* Content Area */}
            <div className="flex-1 rounded-xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold">General Settings</h2>
                    <p className="text-sm text-muted-foreground">Basic platform configurations.</p>
                  </div>
                  
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Company Name</label>
                      <input 
                        defaultValue={settings.general?.companyName}
                        className="w-full rounded-lg border border-border/40 bg-background/50 px-4 py-2 outline-none focus:border-accent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Support Email</label>
                      <input 
                        type="email"
                        defaultValue={settings.general?.supportEmail}
                        className="w-full rounded-lg border border-border/40 bg-background/50 px-4 py-2 outline-none focus:border-accent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Timezone</label>
                      <select 
                        defaultValue={settings.general?.timezone}
                        className="w-full rounded-lg border border-border/40 bg-background/50 px-4 py-2 outline-none focus:border-accent"
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">EST</option>
                        <option value="PST">PST</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Currency</label>
                      <select 
                        defaultValue={settings.general?.currency}
                        className="w-full rounded-lg border border-border/40 bg-background/50 px-4 py-2 outline-none focus:border-accent"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold">Security Policies</h2>
                    <p className="text-sm text-muted-foreground">Manage authentication and access controls.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-border/20 bg-background/30 p-4">
                      <div>
                        <p className="font-medium">Require Multi-Factor Authentication (MFA)</p>
                        <p className="text-sm text-muted-foreground">Enforce MFA for all users across the organization.</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" defaultChecked={settings.security?.mfaRequired} className="peer sr-only" />
                        <div className="peer h-6 w-11 rounded-full bg-border/40 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Password Expiry (Days)</label>
                        <input 
                          type="number"
                          defaultValue={settings.security?.passwordExpiryDays}
                          className="w-full rounded-lg border border-border/40 bg-background/50 px-4 py-2 outline-none focus:border-accent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Session Timeout (Minutes)</label>
                        <input 
                          type="number"
                          defaultValue={settings.security?.sessionTimeoutMinutes}
                          className="w-full rounded-lg border border-border/40 bg-background/50 px-4 py-2 outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold">Notification Hub</h2>
                    <p className="text-sm text-muted-foreground">Configure global notification rules and integrations.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-border/20 bg-background/30 p-4">
                      <div>
                        <p className="font-medium">Global Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Allow platform to send email notifications.</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" defaultChecked={settings.notifications?.emailEnabled} className="peer sr-only" />
                        <div className="peer h-6 w-11 rounded-full bg-border/40 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border/20 bg-background/30 p-4">
                      <div>
                        <p className="font-medium">Slack Integration</p>
                        <p className="text-sm text-muted-foreground">Send critical alerts to a designated Slack channel.</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" defaultChecked={settings.notifications?.slackIntegration} className="peer sr-only" />
                        <div className="peer h-6 w-11 rounded-full bg-border/40 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-sm font-medium text-foreground">Global Webhook URL (Optional)</label>
                      <input 
                        type="url"
                        placeholder="https://"
                        defaultValue={settings.notifications?.webhookUrl}
                        className="w-full rounded-lg border border-border/40 bg-background/50 px-4 py-2 outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold">Feature Flags</h2>
                    <p className="text-sm text-muted-foreground">Enable or disable core modules globally.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-border/20 bg-background/30 p-4">
                      <div>
                        <p className="font-medium">Enterprise AI Assistant</p>
                        <p className="text-sm text-muted-foreground">Enable AI co-pilot across the application.</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" defaultChecked={settings.features?.aiEnabled} className="peer sr-only" />
                        <div className="peer h-6 w-11 rounded-full bg-border/40 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border/20 bg-background/30 p-4">
                      <div>
                        <p className="font-medium">Workflow Automation</p>
                        <p className="text-sm text-muted-foreground">Allow users to build custom workflows.</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" defaultChecked={settings.features?.workflowsEnabled} className="peer sr-only" />
                        <div className="peer h-6 w-11 rounded-full bg-border/40 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-end border-t border-border/40 pt-6">
                <button
                  disabled={updateSettingsMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
                >
                  {updateSettingsMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  )
}
