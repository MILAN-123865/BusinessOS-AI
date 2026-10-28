'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FEATURE_TABS } from './landingData'

export function FeatureMatrix() {
  const [activeTabId, setActiveTabId] = useState('financial')
  const activeTab = FEATURE_TABS.find((t) => t.id === activeTabId) || FEATURE_TABS[0]

  return (
    <section id="features" className="relative py-24 bg-[#F0F7FF] border-b border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BAE6FD] bg-[#E0F2FE]/80 px-3 py-0.5 text-xs font-semibold text-[#0284C7] mb-2">
            Platform Architecture · 4 Operational Layers
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0F172A]">
            Every Layer of Operations. One System.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#475569]">
            Explore how BusinessOS unifies financial telemetry, executive AI, agile task matrix, and security.
          </p>
        </div>

        {/* Four Selectable Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-[#E2E8F0] pb-4 mb-12">
          {FEATURE_TABS.map((tab) => {
            const isActive = tab.id === activeTabId
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`py-3 px-4 text-xs sm:text-sm font-semibold text-left border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#0284C7] text-[#0284C7] bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {tab.title}
              </button>
            )
          })}
        </div>

        {/* Tab Content Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Column Description */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-mono font-bold text-[#0284C7] bg-[#E0F2FE] px-2.5 py-1 rounded-md">{activeTab.meta}</span>
              
              <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                {activeTab.subtitle}
              </h3>

              <p className="text-sm text-[#475569] leading-relaxed">
                {activeTab.description}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {activeTab.metrics.map((m, i) => (
                  <div key={i} className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
                    <p className="text-xs font-semibold text-[#64748B]">{m.label}</p>
                    <div className="flex items-baseline justify-between mt-1">
                      <p className="text-lg font-bold text-[#0F172A]">{m.value}</p>
                      {m.trend && (
                        <span className="text-xs font-semibold text-emerald-600">{m.trend}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column Visual Panel */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-md shadow-sky-950/5">
                
                {/* Visual 1: Financial Telemetry */}
                {activeTab.id === 'financial' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                      <span className="font-bold text-[#0F172A]">Financial Operating Telemetry</span>
                      <span className="text-xs text-[#0284C7] font-semibold bg-[#E0F2FE] px-2 py-0.5 rounded-md">Real-time stream</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-4 bg-[#F0F7FF] rounded-xl border border-[#BAE6FD]">
                        <p className="text-[#64748B] font-semibold">Revenue</p>
                        <p className="text-base font-extrabold text-[#0F172A] mt-1">$2.84M</p>
                      </div>
                      <div className="p-4 bg-[#F0F7FF] rounded-xl border border-[#BAE6FD]">
                        <p className="text-[#64748B] font-semibold">Margin</p>
                        <p className="text-base font-extrabold text-[#0284C7] mt-1">34.2%</p>
                      </div>
                      <div className="p-4 bg-[#F0F7FF] rounded-xl border border-[#BAE6FD]">
                        <p className="text-[#64748B] font-semibold">Burn</p>
                        <p className="text-base font-extrabold text-[#0F172A] mt-1">$410K</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visual 2: Executive AI Copilot */}
                {activeTab.id === 'copilot' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                      <span className="font-bold text-[#0F172A]">Executive Copilot Session</span>
                      <span className="text-xs text-[#0284C7] font-semibold bg-[#E0F2FE] px-2 py-0.5 rounded-md">Context-Aware</span>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-xl bg-[#F8FAFC] p-3.5 border border-[#E2E8F0] text-[#475569]">
                        <p className="font-bold text-[#0F172A]">User:</p>
                        <p>"Why did operating margin decline this month?"</p>
                      </div>

                      <div className="rounded-xl bg-[#F0F7FF] p-3.5 border border-[#BAE6FD] text-[#0F172A] space-y-1">
                        <p className="font-bold text-[#0284C7]">BusinessOS AI:</p>
                        <p className="leading-relaxed">
                          Margin declined primarily due to a 7.2% increase in infrastructure costs during data migration and delayed enterprise renewals.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visual 3: Agile Task Matrix */}
                {activeTab.id === 'task-matrix' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                      <span className="font-bold text-[#0F172A]">Sprint Execution Matrix</span>
                      <span className="text-[#64748B] font-medium">34 Items</span>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-12 p-2.5 text-[#64748B] font-bold border-b border-[#E2E8F0] bg-[#F8FAFC] rounded-lg">
                        <div className="col-span-5">Task</div>
                        <div className="col-span-3">Team</div>
                        <div className="col-span-4 text-right">Status</div>
                      </div>

                      <div className="grid grid-cols-12 p-2.5 text-[#0F172A] items-center font-medium">
                        <div className="col-span-5 font-semibold">Stripe Webhook Sync</div>
                        <div className="col-span-3 text-[#64748B]">Engineering</div>
                        <div className="col-span-4 text-right text-emerald-600 font-bold">COMPLETED</div>
                      </div>

                      <div className="grid grid-cols-12 p-2.5 text-[#0F172A] items-center font-medium">
                        <div className="col-span-5 font-semibold">Q4 Budget Allocation</div>
                        <div className="col-span-3 text-[#64748B]">Finance</div>
                        <div className="col-span-4 text-right text-[#0284C7] font-bold">IN_PROGRESS</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visual 4: Governance & RBAC */}
                {activeTab.id === 'governance' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                      <span className="font-bold text-[#0F172A]">Immutable Audit Trail</span>
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Enforced</span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-3.5 bg-[#F0F7FF] rounded-xl border border-[#BAE6FD] space-y-1">
                        <div className="flex justify-between text-[#0F172A]">
                          <span className="font-bold text-[#0284C7]">ADMIN_POLICY_UPDATE</span>
                          <span className="text-[#64748B]">2 mins ago</span>
                        </div>
                        <p className="text-[#475569]">
                          User <span className="font-semibold text-[#0F172A]">milan@businessos.com</span> updated Financial Read permissions.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}
