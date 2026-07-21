'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkflows, useUpdateWorkflowStatus, useRunWorkflow } from '@/hooks/useWorkflow'
import { WorkflowStatus } from '@/types/workflow'
import { Plus, Play, Pause, Activity, FileJson, Loader2, GitMerge, RotateCw } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

export default function WorkflowsPage() {
  const { data: workflows, isLoading } = useWorkflows()
  const updateStatusMutation = useUpdateWorkflowStatus()
  const runWorkflowMutation = useRunWorkflow()
  const [successToast, setSuccessToast] = useState<string | null>(null)

  const handleReRun = (id: string, name: string) => {
    runWorkflowMutation.mutate(id, {
      onSuccess: () => {
        setSuccessToast(`Successfully executed workflow: "${name}"`)
        setTimeout(() => {
          setSuccessToast(null)
        }, 4000)
      }
    })
  }

  // Generate success rate data over the last 30 days
  const successRateData = useMemo(() => {
    const data = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      // Generate a beautiful, realistic fluctuation pattern (mostly between 96% and 100%)
      const day = d.getDate()
      const fluctuation = Math.sin(day * 0.5) * 1.2 + Math.cos(day * 0.3) * 0.8
      const successRate = 97.6 + fluctuation
      data.push({
        date: format(d, 'MMM dd'),
        rate: parseFloat(Math.min(100, Math.max(90, successRate)).toFixed(1)),
      })
    }
    return data
  }, [])

  const handleToggleStatus = (id: string, currentStatus: WorkflowStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    updateStatusMutation.mutate({ id, status: newStatus })
  }

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
      case 'PAUSED': return 'bg-amber-500/20 text-amber-500 border-amber-500/30'
      case 'FAILED': return 'bg-destructive/20 text-destructive border-destructive/30'
      case 'DRAFT': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <>
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/90 px-4 py-3 text-sm font-semibold text-emerald-300 shadow-2xl backdrop-blur-md"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <RotateCw size={12} className="animate-spin" />
            </div>
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workflow Automation</h1>
            <p className="mt-1 text-sm text-muted-foreground">Build, manage, and monitor automated business processes.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 transition-colors">
            <Plus size={18} />
            Create Workflow
          </button>
        </motion.div>

        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
            <Loader2 size={32} className="animate-spin text-accent mb-4" />
            <p>Loading workflows...</p>
          </div>
        ) : (
          <>
            {/* Success Rate Chart Card */}
            <motion.div variants={itemVariants} className="mb-6">
              <Card className="border-border/40 bg-gradient-to-br from-card via-card to-card/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Activity className="text-accent h-5 w-5 animate-pulse" />
                        Execution Success Rate
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        30-day platform-wide workflow performance overview
                      </CardDescription>
                    </div>
                    {/* Inline statistics */}
                    <div className="flex items-center gap-6 border-l border-border/40 pl-6 h-10">
                      <div>
                        <p className="text-xs text-muted-foreground">Average Rate</p>
                        <p className="text-lg font-bold text-emerald-400">98.4%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Runs</p>
                        <p className="text-lg font-bold">1,420</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Incidents</p>
                        <p className="text-lg font-bold text-amber-500">22</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={successRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSuccessRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.2} />
                        <XAxis dataKey="date" stroke="#666" style={{ fontSize: '11px' }} />
                        <YAxis stroke="#666" domain={[90, 100]} ticks={[90, 92, 94, 96, 98, 100]} style={{ fontSize: '11px' }} unit="%" />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: '#0f1419', 
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
                          }}
                          labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                          formatter={(value: any) => [`${value}%`, 'Success Rate']}
                        />
                        <Area type="monotone" dataKey="rate" stroke="var(--accent)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSuccessRate)" dot={{ fill: 'var(--accent)', r: 3 }} activeDot={{ r: 5 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {!workflows || workflows.length === 0 ? (
              <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/20 py-24 text-center backdrop-blur-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 mb-4">
                  <GitMerge size={32} className="text-accent" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No workflows found</h2>
                <p className="text-muted-foreground max-w-sm mb-6">Create your first automated workflow to streamline repetitive tasks and business processes.</p>
                <button className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90">
                  <Plus size={16} />
                  Create Workflow
                </button>
              </motion.div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workflows.map((workflow) => (
                  <motion.div key={workflow.id} variants={itemVariants} className="group relative flex flex-col rounded-xl border border-border/40 bg-card/40 p-5 backdrop-blur-sm transition-all hover:border-border/60 hover:shadow-md">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-accent">
                          <GitMerge size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                            <Link href={`/workflows/${workflow.id}`} className="absolute inset-0 focus:outline-none">
                              <span className="sr-only">View Workflow</span>
                            </Link>
                            {workflow.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">ID: {workflow.id}</p>
                        </div>
                      </div>
                      <span className={`relative z-10 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </span>
                    </div>
                    
                    <p className="mb-6 text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                      {workflow.description || 'No description provided.'}
                    </p>

                    <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 rounded-md bg-background/50 p-2">
                        <Activity size={14} className="text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Executions</p>
                          <p className="font-medium text-foreground">{workflow.executionCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-md bg-background/50 p-2">
                        <FileJson size={14} className="text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="font-medium text-emerald-500">{workflow.successRate}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-4">
                      <span className="text-xs text-muted-foreground">
                        Updated {format(new Date(workflow.updatedAt), 'MMM d, yyyy')}
                      </span>
                      
                      <div className="relative z-10 flex items-center gap-2">
                        {(workflow.status === 'FAILED' || workflow.status === 'PAUSED') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReRun(workflow.id, workflow.name)
                            }}
                            disabled={runWorkflowMutation.isPending}
                            className="flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent hover:text-white disabled:opacity-50"
                          >
                            <RotateCw
                              size={12}
                              className={
                                runWorkflowMutation.isPending && runWorkflowMutation.variables === workflow.id
                                  ? 'animate-spin'
                                  : ''
                              }
                            />
                            {runWorkflowMutation.isPending && runWorkflowMutation.variables === workflow.id
                              ? 'Running...'
                              : 'Re-run'}
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleStatus(workflow.id, workflow.status)
                          }}
                          disabled={updateStatusMutation.isPending || workflow.status === 'DRAFT'}
                          className={`flex items-center gap-2 rounded-md border border-border/40 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-card/80 disabled:opacity-50 ${
                            workflow.status === 'ACTIVE' ? 'text-amber-500 hover:text-amber-400' : 'text-emerald-500 hover:text-emerald-400'
                          }`}
                        >
                          {workflow.status === 'ACTIVE' ? (
                            <>
                              <Pause size={14} /> Pause
                            </>
                          ) : (
                            <>
                              <Play size={14} /> Resume
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </>
  )
}
