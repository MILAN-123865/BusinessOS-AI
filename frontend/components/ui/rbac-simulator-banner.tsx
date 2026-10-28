'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Check,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { PRESET_SIMULATED_ROLES, SimulatedRoleProfile } from '@/types/rbac'

export function RbacSimulatorBanner() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const simulatedRole = useAuthStore((state) => state.simulatedRole)
  const setSimulatedRole = useAuthStore((state) => state.setSimulatedRole)
  const resetSimulation = useAuthStore((state) => state.resetSimulation)
  const user = useAuthStore((state) => state.user)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activePersona: SimulatedRoleProfile = simulatedRole || {
    id: 'real_admin',
    name: user?.is_superuser ? 'Super Administrator' : `${user?.first_name || 'Admin'} (Real User)`,
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    tagline: 'Default authentic logged-in account',
    description: 'Operating with default account permissions without simulation overrides.',
    isSuperuser: true,
    clearanceLevel: 'Tier 1 - Full Enterprise Admin',
    avatar: '👑',
    permissions: []
  }

  const isSimulating = !!simulatedRole

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all border shadow-xs cursor-pointer ${
          isSimulating
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700/80 hover:text-white'
        }`}
        title="Role-Based Access Control (RBAC) Simulator"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{activePersona.avatar}</span>
          <span className="truncate max-w-[130px] sm:max-w-[170px]">
            {isSimulating ? `Simulating: ${activePersona.name}` : 'Role: Admin'}
          </span>
        </div>
        {isSimulating && (
          <span className="hidden sm:inline-flex rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-bold text-amber-300 uppercase tracking-wider">
            Sim
          </span>
        )}
        <ChevronDown size={12} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Modal Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-[#0B132B] p-3 text-slate-200 shadow-2xl z-50 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Layers size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">RBAC Role Simulator</h4>
                  <p className="text-[10px] text-slate-400">Test UI & API permissions in real time</p>
                </div>
              </div>

              {isSimulating && (
                <button
                  onClick={() => {
                    resetSimulation()
                    setIsOpen(false)
                  }}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Reset to default admin"
                >
                  <RotateCcw size={11} />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Persona Preset List */}
            <div className="space-y-1.5 my-2 max-h-64 overflow-y-auto pr-1">
              {PRESET_SIMULATED_ROLES.map((role) => {
                const isSelected = simulatedRole?.id === role.id
                return (
                  <div
                    key={role.id}
                    onClick={() => {
                      setSimulatedRole(role)
                      setIsOpen(false)
                    }}
                    className={`group flex items-start justify-between rounded-xl p-2.5 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/40 text-white shadow-xs'
                        : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/70 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-base mt-0.5">{role.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-100">{role.name}</span>
                          {role.isSuperuser && (
                            <span className="rounded bg-indigo-500/20 px-1 text-[9px] font-bold text-indigo-300 border border-indigo-500/30">
                              Root
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{role.tagline}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-slate-500">
                            {role.permissions.length} active permissions
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-1">
                      {isSelected ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white shadow-xs">
                          <Check size={11} />
                        </div>
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-slate-700 group-hover:border-slate-500" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer with link to Full RBAC Testing Sandbox */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <Link
                href="/rbac-simulator"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>Open RBAC Testing Sandbox & Matrix</span>
                <ExternalLink size={11} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
