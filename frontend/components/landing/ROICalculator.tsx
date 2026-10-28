'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calculator } from 'lucide-react'

export function ROICalculator() {
  const [teamSize, setTeamSize] = useState(150)
  const [hourlyCost, setHourlyCost] = useState(1200)
  const [hoursSaved, setHoursSaved] = useState(6)

  // Calculations
  const weeklyHoursSaved = teamSize * hoursSaved
  const monthlyHoursSaved = Math.round(weeklyHoursSaved * 4.33)
  const annualHoursSaved = weeklyHoursSaved * 52
  const annualGrossSavings = annualHoursSaved * hourlyCost
  
  // Subscription cost estimate (~₹18,000 / seat / year)
  const estimatedSubscriptionCost = teamSize * 18000
  const netSavings = Math.max(0, annualGrossSavings - estimatedSubscriptionCost)
  const roiPercentage = estimatedSubscriptionCost > 0 
    ? Math.round((netSavings / estimatedSubscriptionCost) * 100) 
    : 0

  const formatINR = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`
    } else if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakhs`
    } else {
      return `₹${val.toLocaleString('en-IN')}`
    }
  }

  return (
    <section id="roi" className="relative py-24 bg-white border-b border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BAE6FD] bg-[#E0F2FE]/80 px-3 py-0.5 text-xs font-semibold text-[#0284C7] mb-2">
            Financial Telemetry · Interactive ROI Model
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0F172A]">
            Calculate Your Operational ROI
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#475569]">
            Estimate the financial impact of consolidating fragmented tools into BusinessOS.
          </p>
        </div>

        {/* Outer Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-2xl border border-[#BAE6FD]/80 bg-[#F0F7FF] p-6 sm:p-8 shadow-xl shadow-sky-950/5">
          
          {/* Left Column: Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            
            {/* Slider 1 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-[#0F172A]">
                <label htmlFor="teamSize">Team Size</label>
                <span className="font-mono text-[#0284C7] font-extrabold text-sm">{teamSize} Employees</span>
              </div>
              <input
                id="teamSize"
                type="range"
                min="10"
                max="1000"
                step="10"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
              />
              <div className="flex justify-between text-[11px] font-medium text-[#64748B]">
                <span>10 seats</span>
                <span>1,000 seats</span>
              </div>
            </div>

            {/* Slider 2 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-[#0F172A]">
                <label htmlFor="hourlyCost">Average Hourly Cost per Employee</label>
                <span className="font-mono text-emerald-600 font-extrabold text-sm">₹{hourlyCost.toLocaleString('en-IN')}/hr</span>
              </div>
              <input
                id="hourlyCost"
                type="range"
                min="300"
                max="5000"
                step="100"
                value={hourlyCost}
                onChange={(e) => setHourlyCost(Number(e.target.value))}
                className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] font-medium text-[#64748B]">
                <span>₹300/hr</span>
                <span>₹5,000/hr</span>
              </div>
            </div>

            {/* Slider 3 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-[#0F172A]">
                <label htmlFor="hoursSaved">Operational Hours Saved / Employee / Week</label>
                <span className="font-mono text-[#0284C7] font-extrabold text-sm">{hoursSaved} Hours / Week</span>
              </div>
              <input
                id="hoursSaved"
                type="range"
                min="1"
                max="15"
                step="1"
                value={hoursSaved}
                onChange={(e) => setHoursSaved(Number(e.target.value))}
                className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
              />
              <div className="flex justify-between text-[11px] font-medium text-[#64748B]">
                <span>1 hr/wk</span>
                <span>15 hrs/wk</span>
              </div>
            </div>

            <p className="text-[11px] text-[#64748B]">
              * Projections are based on labor cost inputs and standard consolidation benchmarks.
            </p>

          </div>

          {/* Right Column: Output Metrics (5 cols) */}
          <div className="lg:col-span-5 rounded-xl border border-[#E2E8F0] bg-white p-6 flex flex-col justify-between space-y-6 shadow-md shadow-sky-950/5">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0284C7]">
                Projected Return
              </p>

              <div>
                <p className="text-xs font-semibold text-[#64748B]">Monthly Hours Recovered</p>
                <p className="text-xl font-bold text-[#0F172A] font-mono mt-0.5">
                  {monthlyHoursSaved.toLocaleString()} <span className="text-xs font-medium text-[#64748B]">hrs / month</span>
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#64748B]">Annual Productive Hours Recovered</p>
                <p className="text-xl font-bold text-[#0F172A] font-mono mt-0.5">
                  {annualHoursSaved.toLocaleString()} <span className="text-xs font-medium text-[#64748B]">hrs / year</span>
                </p>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0]">
                <p className="text-xs font-semibold text-[#64748B]">Estimated Annual Gross Operational Savings</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tracking-tight mt-1">
                  {formatINR(annualGrossSavings)}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[#475569] font-medium">Estimated Platform ROI</span>
                <span className="font-mono text-emerald-600 font-extrabold text-sm">{roiPercentage}%</span>
              </div>
            </div>

            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0284C7] py-3 px-4 text-xs font-semibold text-white hover:bg-[#0369A1] transition-all shadow-sm shadow-sky-500/20"
            >
              <span>See Your Enterprise ROI</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  )
}
