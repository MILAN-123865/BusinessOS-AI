'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
import { BusinessOSLogo } from '@/components/ui/business-os-logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call for seamless UX
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#BAE6FD]/40 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#E0F2FE]/60 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center items-center gap-2 mb-6"
        >
          <BusinessOSLogo size={36} showWordmark={true} variant="light" />
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center text-2xl font-bold tracking-tight text-[#0F172A]"
        >
          Reset your password
        </motion.h2>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="bg-white/95 backdrop-blur-xl py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-[#E0F2FE]">
          
          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <Mail className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A]">Check your email</h3>
              <p className="text-[#64748B] text-sm">
                We've sent a password reset link to <span className="font-semibold text-[#0F172A]">{email}</span>.
              </p>
              <div className="pt-4">
                <Link href="/login" className="text-sm font-semibold text-[#0284C7] hover:text-[#0369A1] transition-colors inline-flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </Link>
              </div>
            </motion.div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <p className="text-sm text-[#64748B] text-center mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div>
                <label className="block text-sm font-semibold text-[#334155]">Email address</label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[#94A3B8]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg py-2.5 text-[#0F172A] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] focus:bg-white sm:text-sm transition-all shadow-sm"
                    placeholder="admin@gmail.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-lg bg-[#0284C7] hover:bg-[#0369A1] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight className="ml-2 h-5 w-5 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-4 text-center">
                <Link href="/login" className="text-sm font-semibold text-[#0284C7] hover:text-[#0369A1] transition-colors inline-flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
