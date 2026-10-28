'use client'

import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 bg-[#F0F7FF] border-b border-[#E2E8F0] overflow-hidden">
      {/* Soft Ambient Light Blue Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#BAE6FD]/40 to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Metadata Line */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#BAE6FD] bg-[#E0F2FE]/80 px-3.5 py-1 text-xs font-semibold text-[#0284C7] mb-6 shadow-2xs">
          <span>BusinessOS 4.0</span>
          <span>·</span>
          <span>Executive Operating Architecture</span>
        </div>

        {/* Main Executive Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] max-w-4xl mx-auto leading-[1.15]">
          One Operating System for Your Entire Business
        </h1>

        {/* Supporting Text */}
        <p className="mt-6 text-base sm:text-lg text-[#475569] max-w-2xl mx-auto font-normal leading-relaxed">
          BusinessOS unifies financial intelligence, execution, collaboration, governance, and AI into one operational command center.
        </p>

        {/* Call to Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#0369A1] transition-all shadow-md shadow-sky-500/20"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <a
            href="#cockpit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#BAE6FD] bg-white px-6 py-3.5 text-sm font-semibold text-[#0284C7] hover:bg-[#F0F9FF] transition-all shadow-xs"
          >
            <Play className="h-3.5 w-3.5 fill-current text-[#0284C7]" />
            <span>Explore Live Cockpit</span>
          </a>
        </div>

        {/* Trust Statement & Separator */}
        <p className="mt-6 text-xs font-medium text-[#64748B]">
          Built for modern teams that need visibility without operational fragmentation.
        </p>

        {/* Capability Metadata Strip */}
        <div className="mt-16 pt-8 border-t border-[#E2E8F0] flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-[#475569]">
          <span className="hover:text-[#0284C7] transition-colors">Financial Telemetry</span>
          <span className="text-[#CBD5E1]">·</span>
          <span className="hover:text-[#0284C7] transition-colors">Executive AI Copilot</span>
          <span className="text-[#CBD5E1]">·</span>
          <span className="hover:text-[#0284C7] transition-colors">Agile Execution Matrix</span>
          <span className="text-[#CBD5E1]">·</span>
          <span className="hover:text-[#0284C7] transition-colors">Governance & RBAC</span>
        </div>

      </div>
    </section>
  )
}
