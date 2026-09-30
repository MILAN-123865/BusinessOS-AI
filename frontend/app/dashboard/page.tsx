'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  ShoppingCart,
  RefreshCw,
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

const getEventIcon = (type: string) => {
  switch (type) {
    case 'meeting':
      return Clock
    case 'review':
      return AlertCircle
    default:
      return CheckCircle2
  }
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'project':
      return FolderOpen
    case 'employee':
      return Users
    default:
      return CheckCircle2
  }
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
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E7EB] pb-5"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
                Dashboard Overview
              </h1>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-[#16A34A] border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                Live System
              </span>
            </div>
            <p className="mt-1 text-sm text-[#6B7280]">
              Real-time enterprise metrics, workspace activities, and performance telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#111827] hover:border-[#4F46E5]/40 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Refresh Data"
            >
              <RefreshCw size={13} className={isFetching ? 'animate-spin text-[#4F46E5]' : ''} />
              <span>{isFetching ? 'Syncing...' : 'Sync Data'}</span>
            </button>
            <Link
              href="/tasks"
              className="flex items-center gap-1.5 rounded-xl bg-[#4F46E5] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#4338CA] transition-all"
            >
              <Plus size={14} />
              <span>Create Task</span>
            </Link>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-xl bg-white animate-pulse border border-[#E5E7EB]" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 h-[360px] rounded-xl bg-white animate-pulse border border-[#E5E7EB]" />
              <div className="h-[360px] rounded-xl bg-white animate-pulse border border-[#E5E7EB]" />
            </div>
          </div>
        ) : overviewError ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50/50 p-8 text-center">
            <AlertCircle size={40} className="text-[#DC2626]" />
            <div>
              <h3 className="text-base font-bold text-[#111827]">Backend Offline</h3>
              <p className="max-w-md text-xs text-[#6B7280] mt-1">
                Unable to fetch live telemetry. Ensure backend is running on port 8000.
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4338CA] transition-all cursor-pointer"
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
                      return { icon: Users, color: 'text-[#4F46E5]', bg: 'bg-indigo-50' }
                    }
                    if (k.includes('revenue') || k.includes('profit')) {
                      return { icon: DollarSign, color: 'text-[#16A34A]', bg: 'bg-emerald-50' }
                    }
                    if (k.includes('order')) {
                      return { icon: ShoppingCart, color: 'text-[#D97706]', bg: 'bg-amber-50' }
                    }
                    return { icon: FolderOpen, color: 'text-blue-600', bg: 'bg-blue-50' }
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
                      <Card className="bg-white border-[#E5E7EB]">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-[#6B7280]">{metric.title}</p>
                              <p className="text-2xl font-bold tracking-tight text-[#111827]">
                                {formatKpiValue(key, metric.value)}
                              </p>
                              <div className="pt-1 flex items-center gap-1.5">
                                <Badge
                                  className={`border-0 flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 ${
                                    isUp
                                      ? 'bg-emerald-50 text-[#16A34A]'
                                      : 'bg-red-50 text-[#DC2626]'
                                  }`}
                                >
                                  {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                  <span>{isUp ? '+' : ''}{metric.change}%</span>
                                </Badge>
                                <span className="text-[10px] text-[#6B7280]">vs last month</span>
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
                <h2 className="text-sm font-bold tracking-tight text-[#111827]">
                  Portfolio & Headcount Trends
                </h2>
                <Link
                  href="/analytics"
                  className="flex items-center gap-1 text-xs font-semibold text-[#4F46E5] hover:underline"
                >
                  <span>Full Analytics</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
              {overview?.charts ? (
                <DashboardCharts data={overview.charts} />
              ) : (
                <div className="h-72 rounded-xl bg-white animate-pulse border border-[#E5E7EB] flex items-center justify-center">
                  <span className="text-xs text-[#6B7280]">Loading chart analytics...</span>
                </div>
              )}
            </motion.div>

            {/* Activities & Upcoming Calendar */}
            <motion.div
              variants={containerVariants}
              className="grid gap-6 lg:grid-cols-3"
            >
              {/* Recent Activities */}
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <Card className="bg-white border-[#E5E7EB]">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-sm font-semibold tracking-tight text-[#111827]">
                        Recent Activity
                      </CardTitle>
                      <CardDescription className="text-xs text-[#6B7280]">
                        Real-time audit log & user actions
                      </CardDescription>
                    </div>
                    <Link
                      href="/settings"
                      className="text-xs font-medium text-[#4F46E5] hover:underline"
                    >
                      View All
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {activities.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#6B7280]">
                        No recent activities recorded.
                      </div>
                    ) : (
                      activities.map((activity) => {
                        const Icon = getActivityIcon(activity.type)
                        return (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3 transition-all hover:bg-white hover:border-[#D1D5DB]"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#4F46E5]">
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs text-[#111827] truncate">{activity.title}</p>
                              <p className="text-[11px] text-[#6B7280] line-clamp-1 mt-0.5">{activity.description}</p>
                              <p className="text-[10px] text-[#9CA3AF] mt-0.5">By {activity.user}</p>
                            </div>
                            <span className="text-[10px] font-medium text-[#6B7280] shrink-0">{activity.timestamp}</span>
                          </div>
                        )
                      })
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Upcoming Schedule */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white border-[#E5E7EB]">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-sm font-semibold tracking-tight text-[#111827]">
                        Upcoming Events
                      </CardTitle>
                      <CardDescription className="text-xs text-[#6B7280]">
                        Meetings & milestones
                      </CardDescription>
                    </div>
                    <Link
                      href="/calendar"
                      className="text-xs font-medium text-[#4F46E5] hover:underline"
                    >
                      Calendar
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {events.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#6B7280]">
                        No upcoming events.
                      </div>
                    ) : (
                      events.map((event) => {
                        const Icon = getEventIcon(event.type)
                        return (
                          <div
                            key={event.id}
                            className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-2.5 transition-all hover:bg-white hover:border-[#D1D5DB]"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#4F46E5]">
                              <Icon size={15} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#111827] truncate">{event.title}</p>
                              <p className="text-[10px] text-[#6B7280] truncate mt-0.5">
                                Type: {event.type}
                              </p>
                            </div>
                            <Badge className="bg-slate-100 text-[#6B7280] border border-[#E5E7EB] text-[10px] font-semibold shrink-0">
                              {new Date(event.date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Badge>
                          </div>
                        )
                      })
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </>
        )}
      </motion.div>
    </AppLayout>
  )
}
