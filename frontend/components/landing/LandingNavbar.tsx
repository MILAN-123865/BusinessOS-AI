'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import { BusinessOSLogo } from '@/components/ui/business-os-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#0B132B]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#202F54] py-3.5 shadow-sm'
          : 'bg-[#F0F7FF]/90 dark:bg-[#0B132B]/90 backdrop-blur-xs py-5 border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Brand Mark */}
          <Link href="/landing">
            <BusinessOSLogo size="md" showWordmark={true} />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#475569] dark:text-slate-300">
            <a href="#cockpit" className="hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors">
              Platform
            </a>
            <a href="#features" className="hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors">
              Solutions
            </a>
            <a href="#roi" className="hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors">
              Intelligence
            </a>
            <a href="#security" className="hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors">
              Security
            </a>
            <a href="#pricing" className="hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors">
              Pricing
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-medium text-[#475569] dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-sky-400 transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0369A1] transition-all shadow-sm shadow-sky-500/20"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="rounded-lg p-2 text-[#475569] dark:text-slate-300 hover:bg-[#E0F2FE] dark:hover:bg-slate-800 hover:text-[#0284C7] transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-[#E2E8F0] dark:border-[#202F54] bg-white dark:bg-[#0E1733] px-6 py-6 shadow-lg"
          >
            <div className="flex flex-col gap-4 text-sm font-medium text-[#475569] dark:text-slate-300">
              <a
                href="#cockpit"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#0284C7] dark:hover:text-sky-400 py-1"
              >
                Platform
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#0284C7] dark:hover:text-sky-400 py-1"
              >
                Solutions
              </a>
              <a
                href="#roi"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#0284C7] dark:hover:text-sky-400 py-1"
              >
                Intelligence
              </a>
              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#0284C7] dark:hover:text-sky-400 py-1"
              >
                Security
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#0284C7] dark:hover:text-sky-400 py-1"
              >
                Pricing
              </a>
              <hr className="border-[#E2E8F0] dark:border-[#202F54] my-2" />
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-[#475569] dark:text-slate-300 hover:text-[#0284C7]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0284C7] py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0369A1]"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
