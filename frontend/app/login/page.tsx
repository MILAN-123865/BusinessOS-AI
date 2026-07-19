'use client'

import { useLogin } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { AlertCircle, Lock, Mail, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.email,
      password: data.password,
    })
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#0B1220] px-6 py-12">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] left-[20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[40%] right-[20%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-[420px] rounded-2xl border border-border/40 bg-card/60 p-8 shadow-2xl backdrop-blur-md"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">BusinessOS AI</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your enterprise workstation</p>
        </div>

        {loginMutation.isError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive-foreground"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{(loginMutation.error as any)?.response?.data?.detail || "Invalid email or password."}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                className={`w-full rounded-xl border bg-background/50 py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 ${errors.email ? 'border-destructive/50 focus:border-destructive' : 'border-border/40'}`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-background/50 py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 ${errors.password ? 'border-destructive/50 focus:border-destructive' : 'border-border/40'}`}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-primary/20 px-4 py-3 font-semibold text-accent hover:bg-primary/30 transition-all border border-accent/20 disabled:opacity-50"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </motion.div>
    </main>
  )
}
