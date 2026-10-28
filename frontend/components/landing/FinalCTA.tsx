'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function FinalCTA() {
  return (
    <section className="relative py-24 sm:py-32 bg-[#F0F7FF] border-b border-[#E2E8F0] text-center overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#BAE6FD]/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        <div className="inline-flex items-center gap-2 rounded-full border border-[#BAE6FD] bg-[#E0F2FE]/80 px-3.5 py-1 text-xs font-semibold text-[#0284C7] mb-4">
          Operational Command Center
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
          Run Your Business From One Operating System.
        </h2>

        <p className="mt-4 text-base sm:text-lg text-[#475569] max-w-2xl mx-auto leading-relaxed">
          Replace fragmented workflows with one intelligent operational layer.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#0369A1] transition-all shadow-md shadow-sky-500/20"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#BAE6FD] bg-white px-7 py-3.5 text-sm font-semibold text-[#0284C7] hover:bg-[#F0F9FF] transition-all shadow-xs"
          >
            <span>Sign In to Workstation</span>
          </Link>
        </div>

        <p className="mt-6 text-xs font-medium text-[#64748B]">
          Instant setup · 14-day full access trial · No credit card required
        </p>

      </div>
    </section>
  )
}
