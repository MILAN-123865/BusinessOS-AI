'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { TrendingUp, Users, FolderOpen, CheckCircle2, Clock, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useDashboardOverview, useRecentActivities, useUpcomingEvents } from '@/hooks/useDashboard'
import dynamic from 'next/dynamic'
const DashboardCharts = dynamic(() => import('@/components/dashboard/dashboard-charts').then((mod) => mod.DashboardCharts), { ssr: false })
import { DashboardWidgets } from '@/components/calendar/DashboardWidgets'
import { AIInsightsWidget } from '@/components/dashboard/ai-insights-widget'


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'meeting': return Clock
    case 'review': return AlertCircle
    default: return CheckCircle2
  }
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'project': return FolderOpen
    case 'employee': return Users
    default: return CheckCircle2
  }
}

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading, isError: overviewError, refetch } = useDashboardOverview()
  const { data: activities = [], isLoading: activitiesLoading } = useRecentActivities()
  const { data: events = [], isLoading: eventsLoading } = useUpcomingEvents()

  const formatKpiValue = (key: string, val: number) => {
    if (key === 'revenue') {
      return `$${val.toLocaleString()}`
    }
    return val.toLocaleString()
  }

  const isLoading = overviewLoading || activitiesLoading || eventsLoading

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening across your business.</p>
          </div>
          {overviewError && (
            <button
              onClick={() => refetch()}
              className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20 transition-all"
            >
              Retry Connection
            </button>
          )}
        </motion.div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-card/40 animate-pulse border border-border/40" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 h-[400px] rounded-xl bg-card/40 animate-pulse border border-border/40" />
              <div className="h-[400px] rounded-xl bg-card/40 animate-pulse border border-border/40" />
            </div>
          </div>
        ) : overviewError ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle size={48} className="text-destructive animate-bounce" />
            <h3 className="text-xl font-bold text-foreground">API Connection Failure</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Unable to connect to FastAPI workstation to fetch overview telemetry. Ensure the backend instance is running and fully initialized.
            </p>
            <button
              onClick={() => refetch()}
              className="rounded-xl bg-primary/20 px-6 py-2 font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all"
            >
              Refresh Workstation
            </button>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <motion.div
              variants={containerVariants}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {overview?.metrics &&
                Object.entries(overview.metrics).map(([key, metric]: [string, any]) => {
                  const Icon = key === 'active_employees' ? Users : key === 'active_projects' ? FolderOpen : key === 'completed_tasks' ? CheckCircle2 : TrendingUp
                  const isUp = metric.trend === 'up'
                  return (
                    <motion.div
                      key={key}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="overflow-hidden border-border/40 bg-card/30 backdrop-blur-md transition-all duration-200 hover:shadow-lg hover:border-accent/30">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                              <p className="text-3xl font-bold">{formatKpiValue(key, metric.value)}</p>
                              <div className="pt-2">
                                <Badge
                                  className={`border-0 flex items-center gap-1 w-fit ${
                                    isUp
                                      ? 'bg-emerald-500/10 text-emerald-400'
                                      : 'bg-destructive/10 text-destructive'
                                  }`}
                                >
                                  {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                  <span>{isUp ? '+' : ''}{metric.change}%</span>
                                </Badge>
                              </div>
                            </div>
                            <div className="rounded-lg bg-primary/20 p-3">
                              <Icon size={24} className="text-accent" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
            </motion.div>

            {/* AI Business Insights */}
            <motion.div variants={itemVariants}>
              <AIInsightsWidget />
            </motion.div>

            {/* Calendar & Meeting Management Quick telemetry */}
            <motion.div variants={itemVariants}>
              <DashboardWidgets />
            </motion.div>

            {/* Charts Section */}
            {overview?.charts && (
              <motion.div variants={itemVariants}>
                <DashboardCharts data={overview.charts} />
              </motion.div>
            )}

            {/* Content Grid */}
            <motion.div
              variants={containerVariants}
              className="grid gap-6 lg:grid-cols-3"
            >
              {/* Recent Activity */}
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates from your team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activities.map((activity) => {
                        const Icon = getActivityIcon(activity.type)
                        return (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4 rounded-lg border border-border/40 bg-card/40 p-4 transition-all hover:bg-card/60"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                              <Icon size={20} className="text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate">{activity.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                              <p className="text-xs text-muted-foreground/60 mt-1">By {activity.user}</p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">{activity.timestamp}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Upcoming Events */}
              <motion.div variants={itemVariants}>
                <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>Next 7 days timeline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {events.map((event) => {
                        const Icon = getEventIcon(event.type)
                        return (
                          <div
                            key={event.id}
                            className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/40 p-3 transition-all hover:bg-card/60"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/25">
                              <Icon size={16} className="text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{event.title}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                Organizer: {event.organizer}
                              </p>
                            </div>
                            <Badge className="bg-primary/20 text-accent border-0 text-xs font-semibold">
                              {new Date(event.date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </>
        )}
      </motion.div>
    </>
  )
}
