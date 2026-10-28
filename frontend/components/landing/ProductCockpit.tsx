'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Clock, 
  Users, 
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react'
import { HERO_METRICS, AI_BRIEF_INSIGHTS, PRESET_AI_QUERIES } from './landingData'

export function ProductCockpit() {
  const [userQuery, setUserQuery] = useState('')
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  const handleAskAI = (queryText: string) => {
    setUserQuery(queryText)
    setIsTyping(true)
    setAiResponse(null)

    setTimeout(() => {
      setIsTyping(false)
      if (queryText.includes('margin')) {
        setAiResponse(
          'Operating margin dipped 1.4% in July due to cloud infra expansion, but recovered to 34.2% in August following enterprise renewals.'
        )
      } else if (queryText.includes('blocked')) {
        setAiResponse(
          'Found 3 blocked tasks: 1) Stripe webhook retry queue, 2) AWS KMS key rotation approval, and 3) Enterprise SLA contract sign-off.'
        )
      } else {
        setAiResponse(
          'Q4 ARR forecast is tracking at $38.4M (+24% YoY growth) based on current pipeline conversion rates.'
        )
      }
    }, 500)
  }

  return (
    <section id="cockpit" className="relative py-24 bg-white border-b border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BAE6FD] bg-[#E0F2FE]/80 px-3 py-0.5 text-xs font-semibold text-[#0284C7] mb-2">
            Interactive Product Cockpit · Executive View
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0F172A]">
            Executive Command Center
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#475569]">
            Real-time financial telemetry, task velocity matrix, and automated briefings in one interface.
          </p>
        </div>

        {/* Dashboard Shell Container */}
        <div className="rounded-2xl border border-[#BAE6FD]/80 bg-[#F0F7FF] p-4 sm:p-6 lg:p-8 shadow-xl shadow-sky-950/5">
          
          {/* Top Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0] mb-6">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
              <span className="text-xs text-[#64748B]">
                Updated just now
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs font-medium text-[#475569]">
              <span>14 Active Teams</span>
              <span className="text-[#CBD5E1]">|</span>
              <span>3 Open Risks</span>
              <span className="text-[#CBD5E1]">|</span>
              <span className="text-sky-700 font-semibold">99.99% Uptime</span>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Financial Telemetry & Chart (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Telemetry Numbers */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
                  <p className="text-xs font-semibold text-[#64748B]">Monthly Revenue</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#0F172A] mt-1">{HERO_METRICS.revenue}</p>
                  <p className="text-xs font-semibold text-emerald-600 mt-1">{HERO_METRICS.revenueGrowth}</p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
                  <p className="text-xs font-semibold text-[#64748B]">Annual Run Rate</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#0F172A] mt-1">{HERO_METRICS.arr}</p>
                  <p className="text-xs text-[#64748B] mt-1">ARR</p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
                  <p className="text-xs font-semibold text-[#64748B]">Operating Margin</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#0F172A] mt-1">{HERO_METRICS.operatingMargin}</p>
                  <p className="text-xs font-semibold text-[#0284C7] mt-1">+2.4%</p>
                </div>
              </div>

              {/* Vector SVG Chart */}
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4 text-xs">
                  <span className="font-bold text-[#0F172A]">Revenue Intelligence Curve</span>
                  <span className="text-[#64748B] font-medium">Q1–Q3 2026</span>
                </div>

                <div className="h-40 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 140">
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeDasharray="3" />
                    <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeDasharray="3" />
                    <line x1="0" y1="110" x2="500" y2="110" stroke="#F1F5F9" strokeDasharray="3" />

                    <path
                      d="M0 110 Q 80 100, 160 70 T 320 45 T 500 15"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="3"
                    />

                    <circle cx="160" cy="70" r="4" fill="#0284C7" />
                    <circle cx="320" cy="45" r="4" fill="#0284C7" />
                    <circle cx="500" cy="15" r="5" fill="#10B981" />
                  </svg>

                  <div className="flex justify-between text-[11px] font-medium text-[#64748B] mt-2">
                    <span>Jan</span>
                    <span>Mar</span>
                    <span>May</span>
                    <span>Jul</span>
                    <span>Sep</span>
                  </div>
                </div>
              </div>

              {/* Task Velocity */}
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-3 shadow-xs">
                <div className="flex justify-between text-xs text-[#475569]">
                  <span className="font-bold text-[#0F172A]">Task Execution Velocity</span>
                  <span className="font-medium">1,242 Total Tasks</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[#475569] mb-1 font-medium">
                      <span>Completed ({HERO_METRICS.tasksCompleted})</span>
                      <span className="text-[#0F172A] font-bold">68%</span>
                    </div>
                    <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[68%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#475569] mb-1 font-medium">
                      <span>In Progress ({HERO_METRICS.tasksInProgress})</span>
                      <span className="text-[#0F172A] font-bold">25%</span>
                    </div>
                    <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0284C7] w-[25%]" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Executive Brief & Copilot (5 cols) */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              
              {/* Executive Brief */}
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Executive Brief
                  </span>
                  <span className="text-[11px] font-semibold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-md">Autonomous</span>
                </div>

                <ul className="space-y-3 text-xs text-[#475569]">
                  {AI_BRIEF_INSIGHTS.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#0284C7] shrink-0" />
                      <span className="leading-relaxed">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Copilot Prompt Interaction */}
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-3 shadow-xs">
                <p className="text-xs font-bold text-[#0F172A]">Executive Query Engine</p>

                <div className="flex flex-col gap-1.5">
                  {PRESET_AI_QUERIES.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleAskAI(q)}
                      className="text-left text-xs font-medium text-[#475569] hover:text-[#0284C7] py-1 transition-colors cursor-pointer"
                    >
                      → "{q}"
                    </button>
                  ))}
                </div>

                {/* Output */}
                <AnimatePresence mode="wait">
                  {isTyping && (
                    <div className="text-xs text-[#0284C7] font-medium py-2 flex items-center gap-2">
                      <span className="animate-spin">🌀</span> Querying organization data lake...
                    </div>
                  )}
                  {aiResponse && !isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-xl bg-[#F0F7FF] p-3.5 border border-[#BAE6FD] text-xs text-[#0F172A] space-y-1.5"
                    >
                      <p className="text-[#64748B] font-medium">Q: "{userQuery}"</p>
                      <p className="font-semibold text-[#0369A1]">{aiResponse}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative pt-2">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && userQuery.trim() && handleAskAI(userQuery)}
                    placeholder="Ask about margin, burn, or velocity..."
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 pr-9"
                  />
                  <button
                    onClick={() => userQuery.trim() && handleAskAI(userQuery)}
                    className="absolute right-3 top-4 text-[#0284C7] hover:text-[#0369A1] cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
