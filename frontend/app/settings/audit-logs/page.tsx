'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuditLogs, useExportAuditLogs } from '@/hooks/useAudit'
import { AuditLogFilter, AuditAction } from '@/types/audit'
import { format } from 'date-fns'
import { Search, Download, Filter, FileText, User, ShieldAlert, Loader2, ArrowRight } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

export default function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilter>({})
  const [page, setPage] = useState(1)
  
  const { data, isLoading } = useAuditLogs(filters, page, 50)
  const exportMutation = useExportAuditLogs()

  const handleExport = () => {
    exportMutation.mutate(filters)
  }

  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
      case 'UPDATE': return 'bg-blue-500/20 text-blue-500 border-blue-500/30'
      case 'DELETE': return 'bg-destructive/20 text-destructive border-destructive/30'
      case 'LOGIN': return 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30'
      case 'LOGOUT': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      case 'EXPORT': return 'bg-amber-500/20 text-amber-500 border-amber-500/30'
      case 'APPROVE': return 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
            <p className="mt-1 text-sm text-muted-foreground">Track security events, data modifications, and user access across the enterprise.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={exportMutation.isPending || isLoading}
              className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/60 px-4 py-2 text-sm font-medium hover:bg-card hover:text-foreground disabled:opacity-50"
            >
              {exportMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Export CSV
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 rounded-xl border border-border/40 bg-card/40 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter size={16} />
            Filters:
          </div>
          
          <select 
            className="rounded-lg border border-border/40 bg-background/50 px-3 py-1.5 text-sm outline-none"
            onChange={(e) => setFilters({ ...filters, action: e.target.value as AuditAction | undefined })}
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Logins</option>
            <option value="CREATE">Creations</option>
            <option value="UPDATE">Updates</option>
            <option value="DELETE">Deletions</option>
            <option value="EXPORT">Exports</option>
            <option value="APPROVE">Approvals</option>
          </select>

          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/50 px-3 py-1.5">
            <Search size={14} className="text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by User ID..."
              className="bg-transparent text-sm outline-none w-32"
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div variants={itemVariants} className="rounded-xl border border-border/40 bg-card/40 overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-card/60 border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Resource</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <Loader2 size={24} className="mx-auto animate-spin mb-2" />
                      Loading logs...
                    </td>
                  </tr>
                ) : !data || data.logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <ShieldAlert size={24} className="mx-auto mb-2 opacity-50" />
                      No audit logs found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  data.logs.map((log) => (
                    <tr key={log.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-accent">
                            <User size={12} />
                          </div>
                          <div>
                            <p className="font-medium">{log.userEmail}</p>
                            <p className="text-xs text-muted-foreground">{log.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <FileText size={14} className="text-muted-foreground" />
                          <span>{log.resourceType}</span>
                          {log.resourceId && (
                            <>
                              <ArrowRight size={12} className="text-muted-foreground" />
                              <span className="font-mono text-xs text-muted-foreground">{log.resourceId}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-mono text-xs">
                        {log.ipAddress}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate text-xs text-muted-foreground">
                          {JSON.stringify(log.details)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {data && data.total > 50 && (
            <div className="flex items-center justify-between border-t border-border/40 px-6 py-4">
              <span className="text-sm text-muted-foreground">
                Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, data.total)} of {data.total} results
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded border border-border/40 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 50 >= data.total}
                  className="rounded border border-border/40 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  )
}
