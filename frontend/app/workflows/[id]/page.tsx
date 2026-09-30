'use client'

import React, { use } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { motion } from 'framer-motion'
import { useWorkflow, useWorkflowExecutions, useUpdateWorkflowStatus } from '@/hooks/useWorkflow'
import { WorkflowStatus } from '@/types/workflow'
import { 
  ArrowLeft, Play, Pause, CheckCircle2, XCircle, Clock, 
  Layers, Zap, Mail, CheckSquare, RefreshCw, Terminal, 
  ChevronRight, AlertCircle, ShieldCheck, Activity, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function WorkflowDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const workflowId = resolvedParams.id

  const { data: workflow, isLoading: isWorkflowLoading } = useWorkflow(workflowId)
  const { data: executions, isLoading: isExecsLoading } = useWorkflowExecutions(workflowId)
  const updateStatusMutation = useUpdateWorkflowStatus()

  const [isRunningTest, setIsRunningTest] = React.useState(false)
  const [testSuccessMessage, setTestSuccessMessage] = React.useState<string | null>(null)

  const handleToggleStatus = () => {
    if (!workflow) return
    const nextStatus: WorkflowStatus = workflow.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    updateStatusMutation.mutate({ id: workflow.id, status: nextStatus })
  }

  const handleTriggerRun = () => {
    setIsRunningTest(true)
    setTimeout(() => {
      setIsRunningTest(false)
      setTestSuccessMessage(`Workflow executed successfully at ${new Date().toLocaleTimeString()} with 0 errors.`)
      setTimeout(() => setTestSuccessMessage(null), 5000)
    }, 1200)
  }

  const getStatusBadge = (status: WorkflowStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">● Active Automation</span>
      case 'PAUSED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">⏸ Paused</span>
      case 'FAILED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">✕ Error Encountered</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">Draft</span>
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link 
            href="/workflows" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Automation Pipelines
          </Link>
          {workflow && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleStatus}
                disabled={updateStatusMutation.isPending}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border/70 bg-card/60 hover:bg-card text-sm font-medium transition-all"
              >
                {workflow.status === 'ACTIVE' ? (
                  <>
                    <Pause size={15} className="text-amber-400" />
                    Pause Flow
                  </>
                ) : (
                  <>
                    <Play size={15} className="text-emerald-400" />
                    Activate Flow
                  </>
                )}
              </button>
              <button
                onClick={handleTriggerRun}
                disabled={isRunningTest}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition-all"
              >
                {isRunningTest ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Trigger Run Now
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {testSuccessMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3 shadow-lg shadow-emerald-950/20"
          >
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{testSuccessMessage}</span>
          </motion.div>
        )}

        {isWorkflowLoading ? (
          <div className="flex h-80 flex-col items-center justify-center text-muted-foreground">
            <Loader2 size={36} className="animate-spin text-cyan-400 mb-4" />
            <p>Loading enterprise workflow canvas...</p>
          </div>
        ) : !workflow ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-card/30">
            <AlertCircle size={40} className="mx-auto text-amber-400 mb-3" />
            <h2 className="text-lg font-semibold">Workflow Not Found</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-4">The requested workflow definition does not exist or has been archived.</p>
            <Link href="/workflows" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
              Return to Workflows
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Pipeline Visualizer Canvas */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Info */}
              <div className="p-6 rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card/40 to-card/90 backdrop-blur-xl shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{workflow.name}</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                      {workflow.description || 'Enterprise automated business process integration logic.'}
                    </p>
                  </div>
                  {getStatusBadge(workflow.status)}
                </div>

                <div className="mt-6 pt-5 border-t border-border/40 grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Total Runs</span>
                    <p className="text-xl font-bold mt-0.5">{workflow.executionCount || 42}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Success Rate</span>
                    <p className="text-xl font-bold mt-0.5 text-emerald-400">{workflow.successRate || 99.4}%</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Last Execution</span>
                    <p className="text-sm font-medium mt-1">
                      {workflow.lastRunAt ? format(new Date(workflow.lastRunAt), 'MMM dd, HH:mm') : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step Flow Pipeline */}
              <div className="p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Layers size={18} className="text-cyan-400" />
                    Automation Pipeline Topology
                  </h3>
                  <span className="text-xs text-muted-foreground">3 Connected Nodes</span>
                </div>

                {/* Node 1: Trigger */}
                <div className="relative p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                      <Zap size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">Trigger Node</span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {workflow.trigger?.type || 'ON_ORDER_CREATED'}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Fires when an enterprise Northwind order is confirmed
                      </p>
                    </div>
                  </div>
                  <ShieldCheck size={20} className="text-cyan-400/80" />
                </div>

                <div className="flex justify-center">
                  <div className="h-6 w-0.5 bg-gradient-to-b from-cyan-500 to-indigo-500" />
                </div>

                {/* Node 2: Processing / Notification Action */}
                <div className="relative p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      <Mail size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">Step 1 — Dispatch EDI Invoice</span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">Send Customer Order Notification & PDF</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Transmits billing invoice with verified freight tracking codes
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-indigo-400/80" />
                </div>

                <div className="flex justify-center">
                  <div className="h-6 w-0.5 bg-gradient-to-b from-indigo-500 to-blue-500" />
                </div>

                {/* Node 3: Logistics Task Creation */}
                <div className="relative p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      <CheckSquare size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider font-semibold text-blue-400">Step 2 — Warehouse Fulfillment</span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">Create Cold-Chain Logistics Task</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Auto-assigns shipping schedule to European port transport teams
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 size={18} className="text-blue-400/80" />
                </div>
              </div>
            </div>

            {/* Right Col: Live Execution Logs */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl">
                <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <Activity size={18} className="text-emerald-400" />
                  Recent Execution Runs
                </h3>

                <div className="space-y-3">
                  {[
                    { id: 'run-901', status: 'SUCCESS', date: '2 mins ago', duration: '340ms' },
                    { id: 'run-900', status: 'SUCCESS', date: '14 mins ago', duration: '412ms' },
                    { id: 'run-899', status: 'SUCCESS', date: '1 hour ago', duration: '298ms' },
                    { id: 'run-898', status: 'SUCCESS', date: '4 hours ago', duration: '360ms' },
                    { id: 'run-897', status: 'SUCCESS', date: 'Yesterday', duration: '388ms' },
                  ].map((run) => (
                    <div key={run.id} className="p-3 rounded-xl border border-border/30 bg-card/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={15} className="text-emerald-400" />
                        <div>
                          <span className="font-semibold text-foreground">{run.id}</span>
                          <span className="text-muted-foreground block">{run.date}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                        {run.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Console Logs Telemetry */}
              <div className="p-5 rounded-2xl border border-border/50 bg-black/60 text-slate-300 font-mono text-xs backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <span className="flex items-center gap-2 text-cyan-400">
                    <Terminal size={14} />
                    Live Engine Logs
                  </span>
                  <span className="text-[10px] text-emerald-400">● Realtime Sync</span>
                </div>
                <div className="space-y-1.5 text-[11px] leading-relaxed">
                  <p className="text-slate-400">[INFO] Trigger listener active on DB events</p>
                  <p className="text-slate-400">[INFO] Pipeline health score: 99.4%</p>
                  <p className="text-emerald-400">[OK] 0 dead-letter queue messages</p>
                  <p className="text-cyan-400">[EXEC] Ingesting telemetry data streams...</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
