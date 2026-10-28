'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitMerge,
  Plus,
  Play,
  Pause,
  Activity,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Zap,
  Bot,
  Mail,
  Bell,
  CheckSquare,
  Sliders,
  Database,
  Layers,
  FileText,
  RotateCcw,
  Loader2,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'

interface WorkflowStep {
  id: string
  type: 'trigger' | 'condition' | 'ai' | 'action'
  name: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge: string
}

interface WorkflowDefinition {
  id: string
  name: string
  category: 'Commerce' | 'Inventory' | 'HR' | 'Finance' | 'CRM'
  status: 'ACTIVE' | 'PAUSED'
  executionsCount: number
  successRate: string
  lastRun: string
  description: string
  triggerEvent: string
  steps: WorkflowStep[]
}

const INITIAL_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf-1',
    name: 'High-Value Order Auto-Dispatch & Alert',
    category: 'Commerce',
    status: 'ACTIVE',
    executionsCount: 142,
    successRate: '99.3%',
    lastRun: '12 mins ago',
    description: 'When an order exceeding $1,000 is placed, run AI fraud & inventory verification, notify the Account Executive, and auto-generate a high-priority fulfillment task.',
    triggerEvent: 'orders.created (total_amount > $1,000)',
    steps: [
      {
        id: 's1',
        type: 'trigger',
        name: 'Order Created',
        description: 'New purchase order detected in Northwind DB',
        icon: Database,
        badge: 'Event Trigger'
      },
      {
        id: 's2',
        type: 'condition',
        name: 'Amount > $1,000',
        description: 'Verify order value exceeds enterprise threshold',
        icon: Sliders,
        badge: 'Condition'
      },
      {
        id: 's3',
        type: 'ai',
        name: 'AI Risk & Stock Audit',
        description: 'BusinessOS Copilot verifies inventory allocation and client credit',
        icon: Bot,
        badge: 'AI Engine'
      },
      {
        id: 's4',
        type: 'action',
        name: 'Create Task & Dispatch Alert',
        description: 'Auto-create task in Kanban board + send priority notification',
        icon: CheckSquare,
        badge: 'Action'
      }
    ]
  },
  {
    id: 'wf-2',
    name: 'Low-Stock Autonomous Restock Draft',
    category: 'Inventory',
    status: 'ACTIVE',
    executionsCount: 89,
    successRate: '100%',
    lastRun: '1 hour ago',
    description: 'Monitors warehouse inventory. When stock falls below 15 units, BusinessOS AI generates an autonomous supplier reorder draft and alerts the logistics manager.',
    triggerEvent: 'inventory.threshold_breached (stock <= 15)',
    steps: [
      {
        id: 's1',
        type: 'trigger',
        name: 'Stock Level Low',
        description: 'Inventory item drops to <= 15 units',
        icon: AlertCircle,
        badge: 'Stock Event'
      },
      {
        id: 's2',
        type: 'ai',
        name: 'AI Restock Calculation',
        description: 'Calculates optimal reorder batch size based on 30-day velocity',
        icon: Bot,
        badge: 'AI Engine'
      },
      {
        id: 's3',
        type: 'action',
        name: 'Draft Purchase Order',
        description: 'Create supplier draft & notify Logistics team',
        icon: FileText,
        badge: 'Action'
      }
    ]
  },
  {
    id: 'wf-3',
    name: 'Overdue Invoice Escalation Bot',
    category: 'Finance',
    status: 'ACTIVE',
    executionsCount: 38,
    successRate: '97.4%',
    lastRun: '4 hours ago',
    description: 'Identifies unpaid invoices past due date. Automatically generates a personalized polite follow-up letter and logs an action item in the finance ledger.',
    triggerEvent: 'invoices.overdue (days_overdue > 15)',
    steps: [
      {
        id: 's1',
        type: 'trigger',
        name: 'Invoice Overdue',
        description: 'Invoice due date expired > 15 days',
        icon: Clock,
        badge: 'Time Trigger'
      },
      {
        id: 's2',
        type: 'ai',
        name: 'AI Copilot Dunning Letter',
        description: 'Generates professional tailored reminder copy based on client history',
        icon: Bot,
        badge: 'AI Engine'
      },
      {
        id: 's3',
        type: 'action',
        name: 'Notify Client & Finance Lead',
        description: 'Send follow-up notice & update CRM ledger status',
        icon: Mail,
        badge: 'Action'
      }
    ]
  },
  {
    id: 'wf-4',
    name: 'New Enterprise Team Member Onboarding',
    category: 'HR',
    status: 'PAUSED',
    executionsCount: 16,
    successRate: '100%',
    lastRun: '2 days ago',
    description: 'When a new employee record is created in the directory, automatically assign departmental RBAC roles, create orientation tasks, and schedule a 1-on-1.',
    triggerEvent: 'employees.created',
    steps: [
      {
        id: 's1',
        type: 'trigger',
        name: 'Employee Added',
        description: 'New staff profile added to directory',
        icon: Users,
        badge: 'HR Trigger'
      },
      {
        id: 's2',
        type: 'action',
        name: 'Provision RBAC Roles',
        description: 'Assign department permissions according to job title',
        icon: ShieldCheck,
        badge: 'Security'
      },
      {
        id: 's3',
        type: 'action',
        name: 'Schedule Orientation',
        description: 'Create Kanban onboarding checklist and calendar meeting',
        icon: CheckSquare,
        badge: 'Action'
      }
    ]
  }
]

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>(INITIAL_WORKFLOWS)
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition>(INITIAL_WORKFLOWS[0])
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationActiveStep, setSimulationActiveStep] = useState<number>(-1)
  const [simulationLogs, setSimulationLogs] = useState<string[]>([])
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newWfName, setNewWfName] = useState('')
  const [newWfCategory, setNewWfCategory] = useState<'Commerce' | 'Inventory' | 'HR' | 'Finance' | 'CRM'>('Commerce')
  const [newWfDesc, setNewWfDesc] = useState('')

  const handleToggleStatus = (id: string) => {
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id === id) {
          const nextStatus = wf.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
          const updated = { ...wf, status: nextStatus as 'ACTIVE' | 'PAUSED' }
          if (selectedWorkflow.id === id) setSelectedWorkflow(updated)
          return updated
        }
        return wf
      })
    )
  }

  // Interactive 1-Click Simulation Runner
  const handleRunSimulation = async () => {
    if (isSimulating) return
    setIsSimulating(true)
    setSimulationLogs([])
    setSimulationActiveStep(0)

    const addLog = (msg: string) => {
      setSimulationLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
    }

    addLog(`🚀 Starting simulated trigger for: "${selectedWorkflow.name}"...`)
    addLog(`📥 Listening on event stream: ${selectedWorkflow.triggerEvent}`)

    for (let i = 0; i < selectedWorkflow.steps.length; i++) {
      setSimulationActiveStep(i)
      const step = selectedWorkflow.steps[i]
      await new Promise((resolve) => setTimeout(resolve, 800))
      addLog(`⚡ Step ${i + 1} (${step.name}): ${step.description} - COMPLETED [Latency: 42ms]`)
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
    addLog(`✅ Workflow completed successfully! State committed to database.`)
    setIsSimulating(false)
    setSimulationActiveStep(-1)

    // Increment execution count
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === selectedWorkflow.id
          ? { ...wf, executionsCount: wf.executionsCount + 1, lastRun: 'Just now' }
          : wf
      )
    )
  }

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWfName.trim()) return

    const newWf: WorkflowDefinition = {
      id: `wf-${Date.now()}`,
      name: newWfName.trim(),
      category: newWfCategory,
      status: 'ACTIVE',
      executionsCount: 0,
      successRate: '100%',
      lastRun: 'Never',
      description: newWfDesc.trim() || 'Custom automated business rule.',
      triggerEvent: `${newWfCategory.toLowerCase()}.event_triggered`,
      steps: [
        {
          id: 's1',
          type: 'trigger',
          name: `${newWfCategory} Event Trigger`,
          description: 'Monitors database table mutations',
          icon: Database,
          badge: 'Trigger'
        },
        {
          id: 's2',
          type: 'ai',
          name: 'AI Rule Validation',
          description: 'BusinessOS Copilot verifies payload structure',
          icon: Bot,
          badge: 'AI Engine'
        },
        {
          id: 's3',
          type: 'action',
          name: 'Dispatch Workspace Action',
          description: 'Executes automated task or notification',
          icon: CheckSquare,
          badge: 'Action'
        }
      ]
    }

    setWorkflows((prev) => [newWf, ...prev])
    setSelectedWorkflow(newWf)
    setIsCreateOpen(false)
    setNewWfName('')
    setNewWfDesc('')
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100 dark:border-sky-950 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20">
              <GitMerge size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  Automated Workflow Engine
                </h1>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Real-time Triggers
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Construct autonomous event pipelines, trigger AI evaluations, and streamline business operations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-700 transition-all shadow-md shadow-sky-500/20 cursor-pointer"
            >
              <Plus size={15} />
              <span>Create Workflow</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Left Workflow Selector & Right Interactive Node Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Workflow Directory */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Automation Pipelines ({workflows.length})
              </span>
            </div>

            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {workflows.map((wf) => {
                const isSelected = selectedWorkflow.id === wf.id
                return (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedWorkflow(wf)}
                    className={`group relative rounded-2xl p-4 transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 shadow-md ring-2 ring-sky-400/20'
                        : 'bg-white dark:bg-[#0E1733] border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-sky-100 dark:bg-sky-950 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          {wf.category}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.2 text-[9px] font-bold uppercase ${
                            wf.status === 'ACTIVE'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {wf.status}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleStatus(wf.id)
                        }}
                        className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={wf.status === 'ACTIVE' ? 'Pause Workflow' : 'Activate Workflow'}
                      >
                        {wf.status === 'ACTIVE' ? <Pause size={13} /> : <Play size={13} />}
                      </button>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                      {wf.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {wf.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Executions: <strong>{wf.executionsCount}</strong></span>
                      <span>Success: <strong className="text-emerald-600">{wf.successRate}</strong></span>
                      <span>{wf.lastRun}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Interactive Step Visualizer & Simulation Console */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-5 shadow-xs">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-100 dark:border-sky-950">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedWorkflow.name}
                    </h3>
                    <span className="rounded bg-sky-100 dark:bg-sky-950 px-1.5 py-0.2 text-[10px] font-bold text-sky-700 dark:text-sky-300">
                      {selectedWorkflow.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Trigger: <code className="font-mono text-[11px] text-sky-600 dark:text-sky-400">{selectedWorkflow.triggerEvent}</code>
                  </p>
                </div>

                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSimulating ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Simulating Run...</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} className="fill-white" />
                      <span>Simulate Run</span>
                    </>
                  )}
                </button>
              </div>

              {/* Visual Pipeline Node Sequence */}
              <div className="py-6 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Workflow Step Pipeline ({selectedWorkflow.steps.length} Nodes)
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedWorkflow.steps.map((step, idx) => {
                    const Icon = step.icon
                    const isStepActive = simulationActiveStep === idx
                    const isStepCompleted = simulationActiveStep > idx || simulationActiveStep === -1 && simulationLogs.length > 0
                    
                    return (
                      <div key={step.id} className="relative">
                        <div
                          className={`flex items-start gap-3 rounded-2xl p-3.5 border transition-all ${
                            isStepActive
                              ? 'bg-sky-50 dark:bg-sky-950/70 border-sky-400 shadow-md ring-2 ring-sky-400/30'
                              : 'bg-slate-50/70 dark:bg-[#070D1E] border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs shadow-xs ${
                              isStepActive
                                ? 'bg-sky-600 text-white animate-pulse'
                                : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                            }`}
                          >
                            <Icon size={17} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                  {idx + 1}. {step.name}
                                </span>
                                <span className="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 dark:text-slate-400">
                                  {step.badge}
                                </span>
                              </div>
                              {isStepCompleted && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle size={12} /> Ready
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>

                        {idx < selectedWorkflow.steps.length - 1 && (
                          <div className="flex justify-center py-1">
                            <div className="h-3 w-0.5 bg-sky-300 dark:bg-sky-800" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Simulation Output Terminal Log */}
              <div className="pt-3 border-t border-sky-100 dark:border-sky-950">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={12} /> Simulation Execution Log
                  </span>
                  {simulationLogs.length > 0 && (
                    <button
                      onClick={() => setSimulationLogs([])}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300 min-h-[110px] max-h-48 overflow-y-auto space-y-1">
                  {simulationLogs.length === 0 ? (
                    <div className="text-slate-500 flex items-center gap-2">
                      <span>Ready. Click &quot;Simulate Run&quot; to test workflow triggers against live events.</span>
                    </div>
                  ) : (
                    simulationLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-sky-400">&gt; </span>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Workflow Modal */}
        <AnimatePresence>
          {isCreateOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-lg rounded-2xl border border-sky-100 dark:border-sky-900 bg-white dark:bg-[#0B132B] p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-sky-950">
                  <div className="flex items-center gap-2">
                    <GitMerge size={18} className="text-sky-600 dark:text-sky-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Workflow</h3>
                  </div>
                  <button
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateWorkflow} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Workflow Name
                    </label>
                    <input
                      type="text"
                      value={newWfName}
                      onChange={(e) => setNewWfName(e.target.value)}
                      placeholder="e.g. VIP Client Welcome Sequence"
                      required
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] px-3.5 py-2.5 text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={newWfCategory}
                      onChange={(e) => setNewWfCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] px-3.5 py-2.5 text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500"
                    >
                      <option value="Commerce">Commerce & Orders</option>
                      <option value="Inventory">Inventory & Supply Chain</option>
                      <option value="Finance">Finance & Invoices</option>
                      <option value="HR">HR & Team Onboarding</option>
                      <option value="CRM">CRM & Client Engagement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Description & Objective
                    </label>
                    <textarea
                      value={newWfDesc}
                      onChange={(e) => setNewWfDesc(e.target.value)}
                      rows={3}
                      placeholder="Explain what event triggers this rule and what actions are dispatched..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] px-3.5 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateOpen(false)}
                      className="rounded-xl px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-sky-600 px-5 py-2 font-bold text-white hover:bg-sky-700 transition-colors shadow-xs cursor-pointer"
                    >
                      Save Workflow
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
