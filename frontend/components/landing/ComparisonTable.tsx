'use client'

import { Check, X } from 'lucide-react'
import { COMPARISON_ROWS } from './landingData'

export function ComparisonTable() {
  return (
    <section className="relative py-24 bg-[#F0F7FF] border-b border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BAE6FD] bg-[#E0F2FE]/80 px-3 py-0.5 text-xs font-semibold text-[#0284C7] mb-2">
            Architecture Comparison · Single Operating Plane
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0F172A]">
            Replace the Fragmented Stack
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#475569]">
            Eliminate context switching, overlapping license fees, and data silos across your organization.
          </p>
        </div>

        {/* Table Container */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden shadow-md shadow-sky-950/5">
          
          {/* Header Row */}
          <div className="grid grid-cols-12 bg-[#F8FAFC] border-b border-[#E2E8F0] p-4 text-xs font-bold text-[#0F172A]">
            <div className="col-span-5">Enterprise Capability</div>
            <div className="col-span-4 text-[#0284C7] font-extrabold">BusinessOS (Unified)</div>
            <div className="col-span-3 text-[#64748B]">Fragmented Stack</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#E2E8F0] text-xs">
            {COMPARISON_ROWS.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 p-4 items-center hover:bg-[#F0F7FF]/50 transition-colors"
              >
                <div className="col-span-5 font-semibold text-[#0F172A]">
                  {row.capability}
                </div>

                <div className="col-span-4 flex items-center gap-2 text-emerald-600 font-semibold">
                  {typeof row.businessOS === 'boolean' ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-[#0F172A]">Unified Platform</span>
                    </>
                  ) : (
                    <span className="text-[#0284C7] font-bold">{row.businessOS}</span>
                  )}
                </div>

                <div className="col-span-3 text-[#64748B]">
                  {typeof row.legacyStack === 'boolean' ? (
                    row.legacyStack ? (
                      <Check className="h-4 w-4 text-[#64748B] shrink-0" />
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-500 font-medium">
                        <X className="h-4 w-4 text-rose-500 shrink-0" />
                        <span>Not Supported</span>
                      </div>
                    )
                  ) : (
                    <span>{row.legacyStack}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  )
}
