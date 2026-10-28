'use client'

export function SocialProof() {
  return (
    <section className="relative py-20 bg-[#F0F7FF] border-b border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BAE6FD] bg-[#E0F2FE]/80 px-3 py-0.5 text-xs font-semibold text-[#0284C7] mb-2">
            Operational Pillars · Enterprise Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
            Engineered for Executive & Operations Leaders
          </h2>
          <p className="mt-2 text-sm text-[#475569]">
            BusinessOS provides single-pane-of-glass operational control across fast-scaling organizations.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 space-y-2 shadow-xs hover:shadow-md hover:border-[#BAE6FD] transition-all">
            <h3 className="text-sm font-bold text-[#0F172A]">Unified Telemetry</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Consolidate financial variance, project velocity, and ARR growth into a real-time executive cockpit.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 space-y-2 shadow-xs hover:shadow-md hover:border-[#BAE6FD] transition-all">
            <h3 className="text-sm font-bold text-[#0F172A]">Executive Copilot</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Autonomous AI assistant with cross-departmental context for instant root-cause analysis.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 space-y-2 shadow-xs hover:shadow-md hover:border-[#BAE6FD] transition-all">
            <h3 className="text-sm font-bold text-[#0F172A]">Strict Governance</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Fine-grained row/column level permissions, SAML 2.0 directory sync, and immutable audit logs.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 space-y-2 shadow-xs hover:shadow-md hover:border-[#BAE6FD] transition-all">
            <h3 className="text-sm font-bold text-[#0F172A]">Zero Friction</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Plug into existing database schemas and REST APIs without breaking ongoing operational workflows.
            </p>
          </div>

        </div>

      </div>
    </section>
  )
}
