'use client'

import { useState } from 'react'
import { useLogin } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { AlertCircle, Lock, Mail, Eye, EyeOff, Loader2, Sparkles, UserCheck, Shield, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const loginMutation = useLogin()
  const [showPassword, setShowPassword] = useState(false)

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

  const handleQuickLogin = (email: string) => {
    setValue('email', email)
    setValue('password', 'Admin123!')
    loginMutation.mutate({
      username: email,
      password: 'Admin123!',
    })
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#070D18] px-4 py-8">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] left-[15%] w-[650px] h-[650px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-[30%] right-[15%] w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-[460px] rounded-3xl border border-border/50 bg-card/75 p-7 md:p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">BusinessOS AI</h1>
          <p className="mt-1 text-xs text-muted-foreground">Sign in to your Northwind enterprise suite</p>
        </div>

        {/* 1-Click Quick Demo Sign-In Selector */}
        <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <UserCheck size={14} />
              1-Click Demo Profiles
            </span>
            <span className="text-[10px] text-muted-foreground">Password: Admin123!</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@example.com')}
              disabled={loginMutation.isPending}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-border/60 bg-card/60 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-center transition-all group"
            >
              <Shield size={16} className="text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Milan</span>
              <span className="text-[10px] text-muted-foreground">Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('andrew.fuller@northwind.com')}
              disabled={loginMutation.isPending}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-border/60 bg-card/60 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-center transition-all group"
            >
              <Users size={16} className="text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Andrew</span>
              <span className="text-[10px] text-muted-foreground">VP Sales</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('nancy.davolio@northwind.com')}
              disabled={loginMutation.isPending}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-border/60 bg-card/60 hover:border-blue-500/50 hover:bg-blue-500/10 text-center transition-all group"
            >
              <UserCheck size={16} className="text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Nancy</span>
              <span className="text-[10px] text-muted-foreground">Sales Rep</span>
            </button>
          </div>
        </div>

        {loginMutation.isError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-5 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{(loginMutation.error as any)?.response?.data?.detail || 'Invalid email or password.'}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <Mail size={17} />
              </span>
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                className={`w-full rounded-xl border bg-background/60 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${errors.email ? 'border-destructive/50' : 'border-border/60'}`}
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <Lock size={17} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-background/60 py-2.5 pl-10 pr-10 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${errors.password ? 'border-destructive/50' : 'border-border/60'}`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In to Workstation'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          New enterprise?{' '}
          <Link href="/register" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
            Create an Account / Sign Up
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
