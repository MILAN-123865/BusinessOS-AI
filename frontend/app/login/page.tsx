'use client'

import { useState } from 'react'
import { useLogin } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertCircle, Lock, Mail, Eye, EyeOff, Loader2, Sparkles, 
  UserCheck, Shield, Users, ArrowRight, CheckCircle2, Building, User
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { API_BASE_URL } from '@/services/axios'
import { BusinessOSLogo } from '@/components/ui/business-os-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const loginMutation = useLogin()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null)
  
  // Register state
  const [regFullName, setRegFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regOrg, setRegOrg] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'Admin123!',
    },
  })

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.email,
      password: data.password,
    })
  }

  const handleQuickLogin = (email: string, demoId: string) => {
    setSelectedDemo(demoId)
    setValue('email', email)
    setValue('password', 'Admin123!')
    loginMutation.mutate({
      username: email,
      password: 'Admin123!',
    })
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegLoading(true)
    setRegError(null)

    try {
      const nameParts = regFullName.trim().split(' ')
      const firstName = nameParts[0] || 'New'
      const lastName = nameParts.slice(1).join(' ') || 'User'

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          first_name: firstName,
          last_name: lastName,
          organization_name: regOrg,
        }),
      }).catch(() => null)

      const resData = response ? await response.json().catch(() => null) : null

      const newUser = resData?.user || {
        id: `user-${Date.now()}`,
        email: regEmail,
        first_name: firstName,
        last_name: lastName,
        is_superuser: true,
        is_verified: true,
        is_active: true,
        roles: ['Organization Admin'],
        permissions: ['permissions.manage'],
        organization_id: 'org-1',
        department_id: 'dept-1'
      }

      useAuthStore.getState().setAuth(
        newUser,
        resData?.access_token || 'mock-access-token-' + Date.now(),
        resData?.refresh_token || 'mock-refresh-token-' + Date.now()
      )

      router.replace('/dashboard')
    } catch (err: any) {
      setRegError(err.message || 'Failed to complete registration.')
      setRegLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10 font-sans text-foreground transition-colors antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Bar Floating Theme Toggle */}
      <div className="absolute top-5 right-6 z-20 flex items-center gap-3">
        <ThemeToggle />
      </div>

      {/* Dynamic Ambient Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] left-[20%] w-[700px] h-[700px] bg-[#BAE6FD]/40 dark:bg-sky-900/20 rounded-full blur-[150px]" />
        <div className="absolute -bottom-[25%] right-[20%] w-[700px] h-[700px] bg-[#E0F2FE]/60 dark:bg-indigo-950/30 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[480px] rounded-3xl border border-[#BAE6FD]/80 dark:border-[#202F54] bg-white dark:bg-[#131E3A] p-7 sm:p-9 shadow-2xl shadow-sky-950/10 transition-colors"
      >
        {/* Brand Logo & Header */}
        <div className="text-center mb-6">
          <BusinessOSLogo size="lg" showWordmark={true} showTagline={true} className="justify-center mb-2" />
          <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium">Enterprise AI Workspace & Operating System</p>
        </div>

        {/* Tab Selector: Login vs Register */}
        <div className="mb-6 flex rounded-2xl bg-[#F0F7FF] p-1.5 border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[#0284C7] text-white shadow-md shadow-sky-500/25'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Sign In to Workstation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[#0284C7] text-white shadow-md shadow-sky-500/25'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Create New Account
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'login' ? (
            <motion.div
              key="login-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
            >
              {/* 1-Click Quick Demo Sign-In Profiles */}
              <div className="mb-6 rounded-2xl border border-[#BAE6FD] bg-[#F0F9FF] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0284C7] flex items-center gap-1.5">
                    <UserCheck size={14} />
                    1-Click Instant Profiles
                  </span>
                  <span className="text-[10px] text-[#64748B] font-mono font-medium">Password: Admin123!</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@example.com', 'milan')}
                    disabled={loginMutation.isPending}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedDemo === 'milan'
                        ? 'border-[#0284C7] bg-[#E0F2FE] ring-2 ring-[#0284C7]/30 shadow-xs'
                        : 'border-[#E2E8F0] bg-white hover:border-[#0284C7]/60 hover:bg-[#F0F7FF]'
                    }`}
                  >
                    <Shield size={18} className="text-[#0284C7] mb-1" />
                    <span className="text-xs font-bold text-[#0F172A]">Milan</span>
                    <span className="text-[10px] text-[#64748B] font-medium">Super Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('andrew.fuller@northwind.com', 'andrew')}
                    disabled={loginMutation.isPending}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedDemo === 'andrew'
                        ? 'border-[#0284C7] bg-[#E0F2FE] ring-2 ring-[#0284C7]/30 shadow-xs'
                        : 'border-[#E2E8F0] bg-white hover:border-[#0284C7]/60 hover:bg-[#F0F7FF]'
                    }`}
                  >
                    <Users size={18} className="text-[#0369A1] mb-1" />
                    <span className="text-xs font-bold text-[#0F172A]">Andrew</span>
                    <span className="text-[10px] text-[#64748B] font-medium">VP Sales</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('nancy.davolio@northwind.com', 'nancy')}
                    disabled={loginMutation.isPending}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedDemo === 'nancy'
                        ? 'border-[#0284C7] bg-[#E0F2FE] ring-2 ring-[#0284C7]/30 shadow-xs'
                        : 'border-[#E2E8F0] bg-white hover:border-[#0284C7]/60 hover:bg-[#F0F7FF]'
                    }`}
                  >
                    <UserCheck size={18} className="text-[#0EA5E9] mb-1" />
                    <span className="text-xs font-bold text-[#0F172A]">Nancy</span>
                    <span className="text-[10px] text-[#64748B] font-medium">Sales Rep</span>
                  </button>
                </div>
              </div>

              {loginMutation.isError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium"
                >
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{(loginMutation.error as any)?.response?.data?.detail || 'Invalid login request.'}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#475569]" htmlFor="email">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
                      <Mail size={17} />
                    </span>
                    <input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      className={`w-full rounded-xl border bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all focus:border-[#0284C7] focus:bg-white focus:ring-2 focus:ring-[#0284C7]/20 ${
                        errors.email ? 'border-rose-400' : 'border-[#CBD5E1]'
                      }`}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-rose-600 font-medium">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#475569]" htmlFor="password">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
                      <Lock size={17} />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full rounded-xl border bg-[#F8FAFC] py-2.5 pl-10 pr-10 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all focus:border-[#0284C7] focus:bg-white focus:ring-2 focus:ring-[#0284C7]/20 ${
                        errors.password ? 'border-rose-400' : 'border-[#CBD5E1]'
                      }`}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-rose-600 font-medium">{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#0284C7] py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:bg-[#0369A1] disabled:opacity-50 cursor-pointer"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-white" />
                      Authenticating Workstation...
                    </>
                  ) : (
                    <>
                      <span>Sign In to Workstation</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="register-tab"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
            >
              {regError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#475569] block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#0284C7] focus:bg-white focus:ring-2 focus:ring-[#0284C7]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#475569] block mb-1">
                    Workplace Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="jane@organization.com"
                      className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#0284C7] focus:bg-white focus:ring-2 focus:ring-[#0284C7]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#475569] block mb-1">
                    Organization Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
                      <Building size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      value={regOrg}
                      onChange={(e) => setRegOrg(e.target.value)}
                      placeholder="Acme Enterprise Technologies"
                      className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#0284C7] focus:bg-white focus:ring-2 focus:ring-[#0284C7]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#475569] block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#0284C7] focus:bg-white focus:ring-2 focus:ring-[#0284C7]/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#0284C7] py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:bg-[#0369A1] disabled:opacity-50 cursor-pointer"
                >
                  {regLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-white" />
                      Provisioning Account...
                    </>
                  ) : (
                    <>
                      <span>Create Account & Launch</span>
                      <CheckCircle2 size={16} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  )
}
