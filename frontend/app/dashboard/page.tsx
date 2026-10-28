'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Users,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
  DollarSign,
  RefreshCw,
  Sparkles,
  Receipt,
  Shield,
  Workflow,
  FileText,
  ShoppingCart,
} from 'lucide-react'
import Link from 'next/link'
import { useDashboardOverview, useRecentActivities, useUpcomingEvents } from '@/hooks/useDashboard'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { DashboardWidgets } from '@/components/calendar/DashboardWidgets'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.04,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
}

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading, isError: overviewError, refetch, isFetching } = useDashboardOverview()
  const { data: activities = [], isLoading: activitiesLoading } = useRecentActivities()
  const { data: events = [], isLoading: eventsLoading } = useUpcomingEvents()

  const formatKpiValue = (key: string, val: number) => {
    if (key.includes('revenue') || key.includes('profit') || key.includes('expenses')) {
      return `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
    return Number(val || 0).toLocaleString()
  }

  const isLoading = overviewLoading || activitiesLoading || eventsLoading

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Dashboard Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E8F0] pb-5"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
                Dashboard Overview
              </h1>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live System
              </span>
            </div>
            <p className="mt-1 text-sm text-[#64748B]">
              Real-time enterprise metrics, workspace activities, and performance telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs font-semibold text-[#475569] hover:text-[#0284C7] hover:border-[#0284C7] hover:bg-[#F0F7FF] transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Refresh Data"
            >
              <RefreshCw size={13} className={isFetching ? 'animate-spin text-[#0284C7]' : ''} />
              <span>{isFetching ? 'Syncing...' : 'Sync Data'}</span>
            </button>
            <Link
              href="/tasks"
              className="flex items-center gap-1.5 rounded-xl bg-[#0284C7] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-500/20 hover:bg-[#0369A1] transition-all"
            >
              <Plus size={14} />
              <span>Create Task</span>
            </Link>
          </div>
        </motion.div>

        {/* Enterprise Quick Launchpad */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/finance"
            className="group flex items-center gap-3 rounded-2xl border border-sky-100 dark:border-sky-950 bg-white dark:bg-[#0B132B] p-3.5 hover:border-sky-300 dark:hover:border-sky-700 transition-all shadow-xs hover:shadow-md"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
              <Receipt size={17} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                Invoices & PDF
                <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-sky-600" />
              </div>
              <p className="text-[10px] text-slate-400">Finance & Billing</p>
            </div>
          </Link>

          <Link
            href="/workflows"
            className="group flex items-center gap-3 rounded-2xl border border-sky-100 dark:border-sky-950 bg-white dark:bg-[#0B132B] p-3.5 hover:border-sky-300 dark:hover:border-sky-700 transition-all shadow-xs hover:shadow-md"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <Workflow size={17} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                Workflows
                <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-600" />
              </div>
              <p className="text-[10px] text-slate-400">Automated Pipelines</p>
            </div>
          </Link>

          <Link
            href="/rbac-simulator"
            className="group flex items-center gap-3 rounded-2xl border border-sky-100 dark:border-sky-950 bg-white dark:bg-[#0B132B] p-3.5 hover:border-sky-300 dark:hover:border-sky-700 transition-all shadow-xs hover:shadow-md"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Shield size={17} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                RBAC Sandbox
                <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-600" />
              </div>
              <p className="text-[10px] text-slate-400">Role Policy Evaluator</p>
            </div>
          </Link>

          <Link
            href="/settings/audit-logs"
            className="group flex items-center gap-3 rounded-2xl border border-sky-100 dark:border-sky-950 bg-white dark:bg-[#0B132B] p-3.5 hover:border-sky-300 dark:hover:border-sky-700 transition-all shadow-xs hover:shadow-md"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <FileText size={17} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                Audit Logs
                <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
              </div>
              <p className="text-[10px] text-slate-400">Security & Compliance</p>
            </div>
          </Link>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-white animate-pulse border border-[#E2E8F0]" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 h-[360px] rounded-2xl bg-white animate-pulse border border-[#E2E8F0]" />
              <div className="h-[360px] rounded-2xl bg-white animate-pulse border border-[#E2E8F0]" />
            </div>
          </div>
        ) : overviewError ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
            <AlertCircle size={40} className="text-rose-500" />
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Backend Offline</h3>
              <p className="max-w-md text-xs text-[#64748B] mt-1">
                Unable to fetch live telemetry. Ensure backend is running on port 8000.
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="rounded-xl bg-[#0284C7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0369A1] transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <motion.div
              variants={containerVariants}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {overview?.metrics &&
                Object.entries(overview.metrics).slice(0, 4).map(([key, metric]: [string, any]) => {
                  const getKpiConfig = (k: string) => {
                    if (k.includes('user') || k.includes('employee')) {
                      return { icon: Users, color: 'text-[#0284C7]', bg: 'bg-[#E0F2FE]' }
                    }
                    if (k.includes('revenue') || k.includes('profit')) {
                      return { icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' }
                    }
                    if (k.includes('order')) {
                      return { icon: ShoppingCart, color: 'text-amber-700', bg: 'bg-amber-50' }
                    }
                    return { icon: FolderOpen, color: 'text-sky-700', bg: 'bg-sky-50' }
                  }

                  const config = getKpiConfig(key)
                  const Icon = config.icon
                  const isUp = metric.trend === 'up'

                  return (
                    <motion.div
                      key={key}
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Card className="bg-white border-[#E2E8F0] shadow-xs hover:border-[#BAE6FD] hover:shadow-md transition-all">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-[#64748B]">{metric.title}</p>
                              <p className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
                                {formatKpiValue(key, metric.value)}
                              </p>
                              <div className="pt-1 flex items-center gap-1.5">
                                <Badge
                                  className={`border-0 flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 ${
                                    isUp
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-rose-50 text-rose-700'
                                  }`}
                                >
                                  {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                  <span>{isUp ? '+' : ''}{metric.change}%</span>
                                </Badge>
                                <span className="text-[10px] font-medium text-[#64748B]">vs last month</span>
                              </div>
                            </div>
                            <div className={`rounded-xl ${config.bg} p-2.5`}>
                              <Icon size={20} className={config.color} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
            </motion.div>

            {/* Quick Summary Widgets */}
            <motion.div variants={itemVariants}>
              <DashboardWidgets />
            </motion.div>

            {/* Charts Section */}
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-tight text-[#0F172A] flex items-center gap-2">
                  <Sparkles size={16} className="text-[#0284C7]" />
                  Portfolio & Headcount Trends
                </h2>
                <Link
                  href="/analytics"
                  className="flex items-center gap-1 text-xs font-semibold text-[#0284C7] hover:text-[#0369A1] hover:underline"
                >
                  <span>Full Analytics</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
              {overview?.charts ? (
                <DashboardCharts data={overview.charts} />
              ) : (
                <div className="h-72 rounded-2xl bg-white animate-pulse border border-[#E2E8F0] flex items-center justify-center">
                  <span className="text-xs text-[#64748B]">Loading chart analytics...</span>
                </div>
              )}
            </motion.div>
          </>
        )}
      </motion.div>
    </AppLayout>
  )
}
