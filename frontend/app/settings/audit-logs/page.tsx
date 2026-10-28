'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Activity,
  Terminal,
  Clock,
  User,
  Database,
  Lock,
  Layers,
  Sparkles,
  Bot,
  AlertTriangle,
  Info,
  RefreshCw,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { ExportDropdown } from '@/components/ui/export-dropdown'

interface AuditEvent {
  id: string
  timestamp: string
  actor: string
  actorRole: string
  module: 'Auth' | 'AI Copilot' | 'RBAC' | 'Commerce' | 'CRM' | 'Workflows' | 'System'
  action: string
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  details: string
  ipAddress: string
  status: 'SUCCESS' | 'BLOCKED' | 'FLAGGED'
}

const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: '2 mins ago',
    actor: 'Milan Rathod',
    actorRole: 'Super Administrator',
    module: 'AI Copilot',
    action: 'SQL_EXECUTE',
    severity: 'INFO',
    details: 'Executed safe readonly SQL: SELECT company_name, city, country FROM clients LIMIT 5',
    ipAddress: '192.168.1.45',
    status: 'SUCCESS',
  },
  {
    id: 'aud-002',
    timestamp: '14 mins ago',
    actor: 'Simulated: Sales Executive',
    actorRole: 'Sales & Client Executive',
    module: 'RBAC',
    action: 'POLICY_EVALUATION',
    severity: 'WARNING',
    details: 'Attempted access to roles.manage -> Blocked by RBAC middleware (403 Forbidden)',
    ipAddress: '127.0.0.1',
    status: 'BLOCKED',
  },
  {
    id: 'aud-003',
    timestamp: '32 mins ago',
    actor: 'Milan Rathod',
    actorRole: 'Super Administrator',
    module: 'Auth',
    action: 'LOGIN_SUCCESS',
    severity: 'INFO',
    details: 'OAuth2 JWT token issued for session (admin@example.com)',
    ipAddress: '192.168.1.45',
    status: 'SUCCESS',
  },
  {
    id: 'aud-004',
    timestamp: '1 hour ago',
    actor: 'Autonomous Engine',
    actorRole: 'System Daemon',
    module: 'Workflows',
    action: 'WORKFLOW_TRIGGERED',
    severity: 'INFO',
    details: 'Triggered "High-Value Order Auto-Dispatch" on Order #10248 ($1,440.00)',
    ipAddress: 'Internal EventBus',
    status: 'SUCCESS',
  },
  {
    id: 'aud-005',
    timestamp: '2 hours ago',
    actor: 'Andrew Fuller',
    actorRole: 'VP Sales & Operations',
    module: 'CRM',
    action: 'CLIENT_EXPORT',
    severity: 'INFO',
    details: 'Exported 91 client records via CSV Spreadsheet',
    ipAddress: '10.216.212.6',
    status: 'SUCCESS',
  },
  {
    id: 'aud-006',
    timestamp: '3 hours ago',
    actor: 'Nancy Davolio',
    actorRole: 'Sales Representative',
    module: 'Commerce',
    action: 'INVENTORY_QUERY',
    severity: 'INFO',
    details: 'Queried low-stock threshold <= 15 units across 77 products',
    ipAddress: '10.216.212.8',
    status: 'SUCCESS',
  },
  {
    id: 'aud-007',
    timestamp: '5 hours ago',
    actor: 'External Gateway',
    actorRole: 'Anonymous Client',
    module: 'System',
    action: 'UNAUTHORIZED_PROBE',
    severity: 'CRITICAL',
    details: 'Detected SQL mutation statement (DROP TABLE) in query param -> Sanitized & rejected',
    ipAddress: '198.51.100.24',
    status: 'FLAGGED',
  },
]

const AUDIT_EXPORT_COLUMNS = [
  { header: 'Event ID', key: 'id' },
  { header: 'Timestamp', key: 'timestamp' },
  { header: 'Actor', key: 'actor' },
  { header: 'Role', key: 'actorRole' },
  { header: 'Module', key: 'module' },
  { header: 'Action', key: 'action' },
  { header: 'Severity', key: 'severity' },
  { header: 'Details', key: 'details' },
  { header: 'IP Address', key: 'ipAddress' },
  { header: 'Status', key: 'status' },
]

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL')
  const [selectedModule, setSelectedModule] = useState<string>('ALL')

  // Filter logs based on search and filters
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === '' ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery)

    const matchesSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity
    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule

    return matchesSearch && matchesSeverity && matchesModule
  })

  // 1-Click Simulated Compliance Event Generator
  const handleSimulateComplianceEvent = () => {
    const randomEvents: Omit<AuditEvent, 'id' | 'timestamp'>[] = [
      {
        actor: 'Milan Rathod',
        actorRole: 'Super Administrator',
        module: 'AI Copilot',
        action: 'TEXT_TO_SQL',
        severity: 'INFO',
        details: 'Queried Northwind orders table with total_amount aggregation',
        ipAddress: '192.168.1.45',
        status: 'SUCCESS',
      },
      {
        actor: 'Simulated Persona',
        actorRole: 'Read-Only Auditor',
        module: 'RBAC',
        action: 'MUTATION_DENIED',
        severity: 'WARNING',
        details: 'Blocked attempt to create task without tasks.manage grant',
        ipAddress: '127.0.0.1',
        status: 'BLOCKED',
      },
      {
        actor: 'Autonomous Engine',
        actorRole: 'System Daemon',
        module: 'Workflows',
        action: 'LOW_STOCK_ALERT',
        severity: 'INFO',
        details: 'Dispatched restock notification for SKU NW-PROD-017 (Stock: 12 units)',
        ipAddress: 'Internal EventBus',
        status: 'SUCCESS',
      },
    ]

    const selected = randomEvents[Math.floor(Math.random() * randomEvents.length)]
    const newLog: AuditEvent = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      ...selected,
    }

    setLogs((prev) => [newLog, ...prev])
  }

  const getSeverityBadge = (severity: AuditEvent['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
      case 'WARNING':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      case 'INFO':
      default:
        return 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
    }
  }

  const getStatusBadge = (status: AuditEvent['status']) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
      case 'BLOCKED':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
      case 'FLAGGED':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800'
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100 dark:border-sky-950 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  Audit Logs & Security Compliance
                </h1>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Immutable Stream
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time chronological record of authentication events, AI database queries, role simulations, and operational actions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateComplianceEvent}
              className="flex items-center gap-1.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/40 px-3 py-2 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-all cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Simulate Event</span>
            </button>
            <ExportDropdown
              filename="BusinessOS_Security_Audit_Logs"
              title="Security & Compliance Audit Ledger"
              subtitle="Enterprise Access & Action Records"
              data={filteredLogs}
              columns={AUDIT_EXPORT_COLUMNS}
            />
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-4 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by actor, action, IP or detail..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-400">
              <Filter size={13} />
              <span className="font-semibold text-[11px]">Severity:</span>
            </div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">INFO Only</option>
              <option value="WARNING">WARNING Only</option>
              <option value="CRITICAL">CRITICAL Only</option>
            </select>

            <div className="flex items-center gap-1 text-slate-400 ml-2">
              <span className="font-semibold text-[11px]">Module:</span>
            </div>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="ALL">All Modules</option>
              <option value="Auth">Auth & Sessions</option>
              <option value="AI Copilot">AI Copilot</option>
              <option value="RBAC">RBAC Policies</option>
              <option value="Commerce">Commerce & Orders</option>
              <option value="CRM">CRM & Clients</option>
              <option value="Workflows">Workflows</option>
              <option value="System">System Infrastructure</option>
            </select>
          </div>
        </div>

        {/* Audit Events Ledger Table */}
        <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070D1E] text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="px-4 py-3">Timestamp / Actor</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Action / Details</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">IP / Host</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No audit events match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <User size={13} className="text-sky-600 dark:text-sky-400" />
                          <span>{log.actor}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          <span>{log.timestamp} • {log.actorRole}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {log.module}
                        </span>
                      </td>

                      <td className="px-4 py-3 max-w-md">
                        <div className="font-mono font-bold text-[11px] text-sky-700 dark:text-sky-300">
                          {log.action}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {log.details}
                        </p>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getSeverityBadge(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {log.ipAddress}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
