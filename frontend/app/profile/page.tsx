'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { useAuthStore } from '@/store/authStore'
import { useUpdateProfile } from '@/hooks/useProfile'
import { motion } from 'framer-motion'
import { User, Lock, Settings, Shield, Mail, Phone, Building2, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const updateProfileMutation = useUpdateProfile()

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Profile Form State
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [phone, setPhone] = useState(user?.phone_number || '')

  // Security Form State
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      await updateProfileMutation.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone || undefined,
      })
      setSuccessMessage('Profile information updated successfully.')
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'An error occurred during save.')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    try {
      await updateProfileMutation.mutateAsync({
        password: password,
      })
      setSuccessMessage('Password changed successfully.')
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to change password. Ensure it meets complexity guidelines.')
    }
  }

  const getInitials = () => {
    if (!user) return 'U'
    return `${user.first_name[0] || ''}${user.last_name[0] || ''}`.toUpperCase()
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Title */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Workstation Account</h1>
          <p className="mt-2 text-muted-foreground">Manage your profile, login settings, and preferences.</p>
        </div>

        {/* Success/Error Banner */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400"
          >
            <CheckCircle size={20} />
            <span className="text-sm font-medium">{successMessage}</span>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive-foreground"
          >
            <AlertCircle size={20} className="text-destructive" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </motion.div>
        )}

        <div className="grid gap-8 md:grid-cols-4">
          {/* Navigation Sidebar */}
          <div className="space-y-1">
            {[
              { id: 'profile', label: 'Profile Info', icon: User },
              { id: 'security', label: 'Security & Login', icon: Shield },
              { id: 'preferences', label: 'Preferences', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any)
                    setSuccessMessage(null)
                    setErrorMessage(null)
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/20 text-accent border border-accent/20'
                      : 'text-muted-foreground hover:bg-card/40 hover:text-foreground'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Form Content Card */}
          <div className="md:col-span-3 rounded-2xl border border-border/40 bg-card/30 p-8 backdrop-blur-md">
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <h3 className="text-xl font-semibold border-b border-border/40 pb-4">Personal Details</h3>

                {/* Avatar Row */}
                <div className="flex items-center gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/30 text-xl font-bold text-accent">
                    {getInitials()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Avatar Image</p>
                    <p className="text-xs text-muted-foreground">Supported file formats: PNG, JPG.</p>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email Address (Read-only)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full rounded-xl border border-border/40 bg-muted/20 px-4 py-2.5 pl-10 text-muted-foreground cursor-not-allowed outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <Phone size={16} />
                    </span>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 pl-10 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary/20 px-6 py-2.5 font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                    <span>Save Profile changes</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <h3 className="text-xl font-semibold border-b border-border/40 pb-4">Workstation Security</h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                {/* Password Policy */}
                <div className="rounded-xl border border-border/20 bg-muted/5 p-4 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Password Complexity Requirements:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Minimum length: 8 characters</li>
                    <li>At least 1 uppercase letter</li>
                    <li>At least 1 lowercase letter</li>
                    <li>At least 1 numerical digit</li>
                    <li>At least 1 special character (!@#$%^&*)</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary/20 px-6 py-2.5 font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold border-b border-border/40 pb-4">System Preferences</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Interface Theme</label>
                    <select className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20">
                      <option value="dark">Dark Theme (Standard)</option>
                      <option value="light">Light Theme</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Primary Working Timezone</label>
                    <select className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20">
                      <option value="utc">UTC (Universal Coordinated Time)</option>
                      <option value="est">EST (Eastern Standard Time)</option>
                      <option value="ist">IST (Indian Standard Time)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
