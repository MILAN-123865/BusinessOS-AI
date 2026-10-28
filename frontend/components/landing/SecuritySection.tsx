'use client'

import { SECURITY_FEATURES } from './landingData'

export function SecuritySection() {
  return (
    <section id="security" className="relative py-24 bg-white border-b border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BAE6FD] bg-[#E0F2FE]/80 px-3 py-0.5 text-xs font-semibold text-[#0284C7] mb-2">
            Security Architecture · Zero-Trust Controls
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0F172A]">
            Enterprise Security & Compliance
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#475569]">
            Engineered with strict zero-trust security controls, multi-tenant data isolation, and cryptographic auditing.
          </p>
        </div>

        {/* Roadmap Notice */}
        <div className="rounded-2xl border border-[#BAE6FD] bg-[#F0F7FF] p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <p className="text-sm font-bold text-[#0F172A]">Designed for Enterprise Compliance</p>
            <p className="text-xs text-[#475569] mt-0.5">
              Built to SOC 2 Type II and ISO 27001 readiness standards with automated compliance evidence collection.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#0284C7] bg-white px-3 py-1 rounded-lg border border-[#BAE6FD] shadow-2xs">SOC 2 READY</span>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECURITY_FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs hover:border-[#0284C7] hover:shadow-md transition-all"
            >
              <h3 className="text-sm font-bold text-[#0F172A] mb-2">{feature.title}</h3>
              <p className="text-xs text-[#475569] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
