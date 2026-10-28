'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { PRICING_PLANS } from './landingData'

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)

  return (
    <section id="pricing" className="relative py-24 bg-white border-b border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BAE6FD] bg-[#E0F2FE]/80 px-3 py-0.5 text-xs font-semibold text-[#0284C7] mb-2">
            Pricing Plans · Predictable Seat Billing
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0F172A]">
            Predictable Plans for Modern Teams
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#475569]">
            No user penalties or complex add-on fees. Scale your organization with confidence.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-3 mb-12 text-xs font-semibold">
          <button
            onClick={() => setIsAnnual(false)}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer ${
              !isAnnual ? 'bg-[#E0F2FE] text-[#0284C7] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Monthly Billing
          </button>
          <span className="text-[#CBD5E1]">|</span>
          <button
            onClick={() => setIsAnnual(true)}
            className={`py-2 px-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              isAnnual ? 'bg-[#E0F2FE] text-[#0284C7] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-emerald-600 font-bold">(Save 20%)</span>
          </button>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PRICING_PLANS.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between border transition-all ${
                  plan.isFeatured
                    ? 'border-[#0284C7] bg-[#F0F7FF] shadow-lg shadow-sky-500/10 ring-2 ring-[#0284C7]/20'
                    : 'border-[#E2E8F0] bg-white shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-[#0F172A]">{plan.name}</h3>
                    {plan.isFeatured && (
                      <span className="text-[11px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-full">Scale Plan</span>
                    )}
                  </div>

                  <p className="text-xs text-[#64748B] mb-6 min-h-[36px]">{plan.description}</p>

                  <div className="mb-6 pb-6 border-b border-[#E2E8F0]">
                    {plan.monthlyPrice === 0 ? (
                      <div className="text-2xl font-extrabold text-[#0F172A]">Custom Pricing</div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-[#0F172A] font-mono">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-medium text-[#64748B]">/ seat / mo</span>
                      </div>
                    )}
                    {isAnnual && plan.monthlyPrice > 0 && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                        Billed annually (₹{(price * 12).toLocaleString('en-IN')}/seat/yr)
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 text-xs text-[#475569]">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#0284C7] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={plan.ctaHref}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-semibold transition-all ${
                    plan.isFeatured
                      ? 'bg-[#0284C7] text-white hover:bg-[#0369A1] shadow-md shadow-sky-500/20'
                      : 'border border-[#CBD5E1] bg-white text-[#0F172A] hover:bg-[#F0F7FF]'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
