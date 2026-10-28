'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Layers,
  Sparkles,
  Check,
  X,
  RotateCcw,
  Sliders,
  Play,
  ArrowRight,
  Lock,
  Unlock,
  Building2,
  Users,
  FolderOpen,
  FileText,
  KeyRound,
  LayoutDashboard,
  HelpCircle,
  Activity,
  Terminal,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { useAuthStore } from '@/store/authStore'
import {
  ALL_SYSTEM_PERMISSIONS,
  PRESET_SIMULATED_ROLES,
  SimulatedRoleProfile,
  PermissionDefinition,
} from '@/types/rbac'

interface EvaluationResult {
  timestamp: string
  module: string
  action: string
  requiredPermission: string
  allowed: boolean
  roleName: string
  reason: string
}

const MODULE_ROUTES = [
  { module: 'Dashboard', path: '/dashboard', requiredPermission: 'dashboard.read', icon: LayoutDashboard },
  { module: 'Projects', path: '/projects', requiredPermission: 'projects.read', icon: FolderOpen },
  { module: 'Clients & CRM', path: '/clients', requiredPermission: 'clients.read', icon: Building2 },
  { module: 'Documents', path: '/documents', requiredPermission: 'documents.read', icon: FileText },
  { module: 'Employee Directory', path: '/employees', requiredPermission: 'employees.read', icon: Users },
  { module: 'Organization Settings', path: '/organization', requiredPermission: 'organization.read', icon: Building2 },
  { module: 'Roles & RBAC', path: '/roles', requiredPermission: 'roles.read', icon: ShieldCheck },
  { module: 'Permissions Matrix', path: '/permissions', requiredPermission: 'permissions.read', icon: KeyRound },
]

export default function RbacSimulatorPage() {
  const user = useAuthStore((state) => state.user)
  const simulatedRole = useAuthStore((state) => state.simulatedRole)
  const setSimulatedRole = useAuthStore((state) => state.setSimulatedRole)
  const resetSimulation = useAuthStore((state) => state.resetSimulation)
  const toggleSimulatedPermission = useAuthStore((state) => state.toggleSimulatedPermission)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const isSuperuserEffective = useAuthStore((state) => state.isSuperuserEffective)

  // Policy Sandbox Interactive Evaluator state
  const [selectedModule, setSelectedModule] = useState('clients')
  const [selectedAction, setSelectedAction] = useState('manage')
  const [evalLogs, setEvalLogs] = useState<EvaluationResult[]>([])

  const activePersona: SimulatedRoleProfile = simulatedRole || {
    id: 'super_admin',
    name: 'Super Administrator',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    tagline: 'Unrestricted root clearance with full system & tenant authority',
    description: 'Possesses all 17 system permissions. Operating in default root mode.',
    isSuperuser: true,
    clearanceLevel: 'Tier 1 - Full Enterprise Admin',
    avatar: '👑',
    permissions: ALL_SYSTEM_PERMISSIONS.map((p) => p.name),
  }

  // Group all system permissions by module
  const groupedPermissions: Record<string, PermissionDefinition[]> = {}
  ALL_SYSTEM_PERMISSIONS.forEach((perm) => {
    if (!groupedPermissions[perm.module]) {
      groupedPermissions[perm.module] = []
    }
    groupedPermissions[perm.module].push(perm)
  })

  // Test Policy Evaluator Action
  const handleRunPolicyEvaluation = () => {
    const permKey = `${selectedModule}.${selectedAction}`
    const isSuper = isSuperuserEffective()
    const allowed = isSuper || hasPermission(permKey)

    const newResult: EvaluationResult = {
      timestamp: new Date().toLocaleTimeString(),
      module: selectedModule,
      action: selectedAction,
      requiredPermission: permKey,
      allowed,
      roleName: activePersona.name,
      reason: allowed
        ? isSuper
          ? 'Passed: Root Superuser bypass grant active.'
          : `Passed: Persona holds explicit grant for [${permKey}].`
        : `Denied: Persona lacks [${permKey}]. Intercepted by RBAC middleware.`,
    }

    setEvalLogs((prev) => [newResult, ...prev.slice(0, 7)])
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100 dark:border-sky-950 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <Layers size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  RBAC Simulator & Policy Sandbox
                </h1>
                <span className="rounded-full bg-sky-100 dark:bg-sky-950/80 px-2.5 py-0.5 text-[11px] font-bold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  Interactive Lab
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Simulate enterprise personas, test policy grants in real time, and audit live route access across BusinessOS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {simulatedRole && (
              <button
                onClick={resetSimulation}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-all cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Reset Simulation</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Persona Selector Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-sky-600 dark:text-sky-400" />
              <span>Select Simulated Persona Profile</span>
            </h2>
            <span className="text-xs text-slate-400">
              Active Persona: <strong className="text-slate-900 dark:text-white">{activePersona.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {PRESET_SIMULATED_ROLES.map((role) => {
              const isSelected = (simulatedRole?.id === role.id) || (!simulatedRole && role.id === 'super_admin')
              return (
                <button
                  key={role.id}
                  onClick={() => setSimulatedRole(role)}
                  className={`group relative flex flex-col justify-between rounded-2xl p-4 text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-sky-50 to-white dark:from-sky-950/50 dark:to-[#0B132B] border-sky-400 dark:border-sky-600 shadow-md ring-2 ring-sky-400/20'
                      : 'bg-white dark:bg-[#0E1733] border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{role.avatar}</span>
                      {isSelected ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-white shadow-xs">
                          <Check size={12} />
                        </span>
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-700 group-hover:border-sky-400" />
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">
                      {role.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {role.tagline}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-sky-700 dark:text-sky-300">
                      {role.permissions.length} perms
                    </span>
                    <span className="text-slate-400 truncate max-w-[80px]">
                      {role.clearanceLevel.split(' - ')[0]}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Interactive Policy Testing Sandbox & Live Route Matrix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Policy Evaluator */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-sky-100 dark:border-sky-950">
                <Terminal size={17} className="text-sky-600 dark:text-sky-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Real-Time Policy Evaluator
                </h3>
              </div>

              <div className="space-y-3.5 mt-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    1. Target Resource Module
                  </label>
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] px-3 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500"
                  >
                    <option value="clients">Clients & Accounts (clients)</option>
                    <option value="employees">Employees & Staff (employees)</option>
                    <option value="roles">Roles & RBAC Policies (roles)</option>
                    <option value="permissions">Permissions Matrix (permissions)</option>
                    <option value="projects">Projects & Roadmaps (projects)</option>
                    <option value="organization">Organization Profile (organization)</option>
                    <option value="departments">Departments Hierarchy (departments)</option>
                    <option value="documents">Document Repository (documents)</option>
                    <option value="dashboard">Dashboard Overview (dashboard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    2. Desired Operation / Action
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAction('read')}
                      className={`rounded-xl px-3 py-2 font-semibold border transition-all cursor-pointer ${
                        selectedAction === 'read'
                          ? 'bg-sky-100 dark:bg-sky-950 border-sky-400 text-sky-700 dark:text-sky-300'
                          : 'bg-slate-50 dark:bg-[#070D1E] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      READ (Inspect/List)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAction('manage')}
                      className={`rounded-xl px-3 py-2 font-semibold border transition-all cursor-pointer ${
                        selectedAction === 'manage'
                          ? 'bg-indigo-100 dark:bg-indigo-950 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-50 dark:bg-[#070D1E] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      MANAGE (Create/Edit/Delete)
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleRunPolicyEvaluation}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-2.5 font-bold text-white shadow-md shadow-sky-500/20 hover:from-sky-700 hover:to-blue-700 transition-all cursor-pointer"
                  >
                    <Play size={14} className="fill-white" />
                    <span>Evaluate RBAC Policy</span>
                  </button>
                </div>
              </div>

              {/* Evaluation Output Trace */}
              <div className="mt-4 pt-3 border-t border-sky-100 dark:border-sky-950">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Evaluation Audit Stream
                  </span>
                  {evalLogs.length > 0 && (
                    <button
                      onClick={() => setEvalLogs([])}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {evalLogs.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center text-xs text-slate-400">
                    Click &quot;Evaluate RBAC Policy&quot; above to simulate real-time middleware verification.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {evalLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className={`rounded-xl p-2.5 border text-xs leading-relaxed ${
                          log.allowed
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono font-bold text-[11px] mb-1">
                          <span className="flex items-center gap-1.5">
                            {log.allowed ? (
                              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <ShieldX size={14} className="text-rose-600 dark:text-rose-400" />
                            )}
                            {log.allowed ? '200 AUTHORIZED' : '403 FORBIDDEN'}
                          </span>
                          <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                        </div>
                        <p className="text-[11px] font-medium">{log.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Route Access Inspection Matrix */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-sky-950">
                <div className="flex items-center gap-2">
                  <Activity size={17} className="text-sky-600 dark:text-sky-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Workspace Route Access Verification
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Reflected across Sidebar & Guard
                </span>
              </div>

              <div className="overflow-x-auto mt-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="pb-2">Workspace Module</th>
                      <th className="pb-2">Route URI</th>
                      <th className="pb-2">Required Policy</th>
                      <th className="pb-2 text-right">Access Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {MODULE_ROUTES.map((route, idx) => {
                      const Icon = route.icon
                      const isAllowed = isSuperuserEffective() || hasPermission(route.requiredPermission)
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Icon size={14} className="text-sky-600 dark:text-sky-400" />
                            <span>{route.module}</span>
                          </td>
                          <td className="py-2.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {route.path}
                          </td>
                          <td className="py-2.5 font-mono text-[11px] text-sky-700 dark:text-sky-300">
                            {route.requiredPermission}
                          </td>
                          <td className="py-2.5 text-right">
                            {isAllowed ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                <Unlock size={10} /> Granted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                                <Lock size={10} /> Restricted
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Granular 17-Permission Toggle Matrix Sandbox */}
        <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-sky-100 dark:border-sky-950">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders size={16} className="text-sky-600 dark:text-sky-400" />
                <span>Granular Permission Toggle Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Toggle individual permissions on the simulated persona and observe application permissions adapt live.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Active Grants: <strong>{activePersona.permissions.length} / {ALL_SYSTEM_PERMISSIONS.length}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
              <div
                key={moduleName}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#070D1E] p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {moduleName}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {perms.length} operations
                  </span>
                </div>

                <div className="space-y-2">
                  {perms.map((perm) => {
                    const has = isSuperuserEffective() || (simulatedRole ? simulatedRole.permissions.includes(perm.name) : true)
                    return (
                      <div
                        key={perm.id}
                        onClick={() => {
                          if (!simulatedRole) {
                            setSimulatedRole(activePersona)
                          }
                          toggleSimulatedPermission(perm.name)
                        }}
                        className={`flex items-start justify-between rounded-lg p-2 transition-all cursor-pointer border ${
                          has
                            ? 'bg-white dark:bg-[#0F172A] border-sky-200 dark:border-sky-900 shadow-2xs'
                            : 'bg-transparent border-transparent opacity-60 hover:opacity-100 hover:bg-white/40 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="pr-2">
                          <p className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                            {perm.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                            {perm.description}
                          </p>
                        </div>

                        <div className="pt-0.5">
                          <div
                            className={`flex h-4 w-8 items-center rounded-full p-0.5 transition-colors ${
                              has ? 'bg-sky-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                            }`}
                          >
                            <div className="h-3 w-3 rounded-full bg-white shadow-xs" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
