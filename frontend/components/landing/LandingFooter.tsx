'use client'

import Link from 'next/link'
import { BusinessOSLogo } from '@/components/ui/business-os-logo'

export function LandingFooter() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white py-16 px-4 sm:px-6 lg:px-8 text-[#475569]">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-2 space-y-3">
            <Link href="/landing">
              <BusinessOSLogo size="md" showWordmark={true} showTagline={true} variant="light" />
            </Link>

            <p className="text-xs text-[#64748B] max-w-sm leading-relaxed mt-2">
              The unified operating system for modern enterprise businesses. Financial telemetry, executive AI, agile task matrix, and strict RBAC.
            </p>

            <p className="text-xs text-[#0284C7] font-mono font-semibold pt-1">
              Version v4.2.0 · Live System Active
            </p>
          </div>

          {/* Platform Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#cockpit" className="hover:text-[#0284C7] transition-colors">Executive Cockpit</a></li>
              <li><a href="#features" className="hover:text-[#0284C7] transition-colors">AI Copilot Engine</a></li>
              <li><a href="#features" className="hover:text-[#0284C7] transition-colors">Financial Telemetry</a></li>
              <li><a href="#features" className="hover:text-[#0284C7] transition-colors">Agile Task Matrix</a></li>
              <li><a href="#security" className="hover:text-[#0284C7] transition-colors">Governance & RBAC</a></li>
            </ul>
          </div>

          {/* Solutions Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-3">Solutions</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/register" className="hover:text-[#0284C7] transition-colors">Startups & Scaleups</Link></li>
              <li><Link href="/register" className="hover:text-[#0284C7] transition-colors">Growing Businesses</Link></li>
              <li><Link href="/login" className="hover:text-[#0284C7] transition-colors">Enterprise Suite</Link></li>
              <li><a href="#roi" className="hover:text-[#0284C7] transition-colors">ROI Calculator</a></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-3">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/documents" className="hover:text-[#0284C7] transition-colors">Documentation</Link></li>
              <li><a href="#security" className="hover:text-[#0284C7] transition-colors">Security Architecture</a></li>
              <li><a href="#pricing" className="hover:text-[#0284C7] transition-colors">Pricing Plans</a></li>
              <li><Link href="/login" className="hover:text-[#0284C7] transition-colors">Demo Workstations</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>© 2026 BusinessOS Inc. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a href="#security" className="hover:text-[#0284C7] transition-colors">Privacy Policy</a>
            <a href="#security" className="hover:text-[#0284C7] transition-colors">Terms of Service</a>
            <a href="#security" className="hover:text-[#0284C7] transition-colors">Security Architecture</a>
          </div>
        </div>

      </div>
    </footer>
  )
}
