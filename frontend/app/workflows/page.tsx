'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { motion } from 'framer-motion'
import { useWorkflows, useUpdateWorkflowStatus } from '@/hooks/useWorkflow'
import { WorkflowStatus } from '@/types/workflow'
import { Plus, Play, Pause, Activity, FileJson, Loader2, GitMerge } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

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
    <AppLayout>
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
        ) : !workflows || workflows.length === 0 ? (
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
                  
                  <div className="relative z-10">
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
      </motion.div>
    </AppLayout>
  )
}
