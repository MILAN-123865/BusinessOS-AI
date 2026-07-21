'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Calendar, Download, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import { useAnalyticsData, useExportAnalytics } from '@/hooks/useAnalytics'
import { AnalyticsFilterParams } from '@/types/analytics'
import dynamic from 'next/dynamic'

const RevenueChart = dynamic(() => import('@/components/analytics/charts').then(mod => mod.RevenueChart), { 
  ssr: false, 
  loading: () => <div className="h-[320px] w-full flex items-center justify-center animate-pulse bg-card/20 rounded-xl"><Loader2 className="animate-spin text-muted-foreground" /></div> 
})

const TaskChart = dynamic(() => import('@/components/analytics/charts').then(mod => mod.TaskChart), { 
  ssr: false, 
  loading: () => <div className="h-[260px] w-full flex items-center justify-center animate-pulse bg-card/20 rounded-xl"><Loader2 className="animate-spin text-muted-foreground" /></div> 
})

const PerformanceChart = dynamic(() => import('@/components/analytics/charts').then(mod => mod.PerformanceChart), { 
  ssr: false, 
  loading: () => <div className="h-[320px] w-full flex items-center justify-center animate-pulse bg-card/20 rounded-xl"><Loader2 className="animate-spin text-muted-foreground" /></div> 
})

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsFilterParams['period']>('month')
  
  const { data: analytics, isLoading, isError, refetch } = useAnalyticsData({ period })
  const exportAnalytics = useExportAnalytics()

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    exportAnalytics.mutate({ format, params: { period } })
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      default: return Minus
    }
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
            <p className="mt-2 text-muted-foreground">Track your business performance and metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as AnalyticsFilterParams['period'])}
              className="rounded-lg border border-border/40 bg-card/40 px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent backdrop-blur-sm"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all_time">All Time</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('pdf')}
              disabled={exportAnalytics.isPending || isLoading}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
            >
              {exportAnalytics.isPending ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              Export Report
            </motion.button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 size={40} className="animate-spin text-accent" />
            <p>Loading analytics data...</p>
          </div>
        ) : isError || !analytics ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive font-semibold">Failed to load analytics data.</p>
            <button onClick={() => refetch()} className="text-accent underline text-sm">Try again</button>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <motion.div
              variants={containerVariants}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {analytics.kpis.map((kpi, idx) => {
                const Icon = getTrendIcon(kpi.trend)
                const isPositive = kpi.trend === 'up'
                const isNeutral = kpi.trend === 'neutral'
                const colors = [
                  { color: 'from-blue-500/20 to-cyan-500/20', accent: '#06b6d4' },
                  { color: 'from-emerald-500/20 to-green-500/20', accent: '#22c55e' },
                  { color: 'from-indigo-500/20 to-purple-500/20', accent: '#4f46e5' },
                  { color: 'from-amber-500/20 to-orange-500/20', accent: '#f59e0b' }
                ]
                const theme = colors[idx % colors.length]
                
                return (
                  <motion.div key={idx} variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                    <div className={`group relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br ${theme.color} p-6 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-xl`}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 50%, ${theme.accent}15, transparent 70%)` }} />
                      <div className="relative z-10">
                        <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                        <div className="mt-4 flex items-end justify-between">
                          <div>
                            <p className="text-3xl font-bold tracking-tight">{kpi.value}</p>
                            <p className={`mt-2 text-xs font-semibold ${isPositive ? 'text-emerald-500' : isNeutral ? 'text-muted-foreground' : 'text-destructive'}`}>
                              {kpi.change}
                            </p>
                          </div>
                          <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="rounded-lg p-3 backdrop-blur-sm" style={{ backgroundColor: `${theme.accent}15` }}>
                            <Icon size={24} style={{ color: theme.accent }} />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Charts Grid */}
            <motion.div
              variants={containerVariants}
              className="grid gap-6 lg:grid-cols-3"
            >
              {/* Area Chart */}
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <Card className="border-border/40 bg-gradient-to-br from-card via-card to-card/50 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Revenue Trend</CardTitle>
                        <CardDescription>Monthly revenue and expense overview</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RevenueChart data={analytics.chartData} />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Pie Chart */}
              <motion.div variants={itemVariants}>
                <Card className="border-border/40 bg-gradient-to-br from-card via-card to-card/50 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                  <CardHeader>
                    <CardTitle>Task Distribution</CardTitle>
                    <CardDescription>By status</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <TaskChart data={analytics.taskDistribution} />
                    <div className="mt-6 grid w-full grid-cols-2 gap-3">
                      {analytics.taskDistribution.map((item, idx) => (
                        <motion.div key={idx} className="flex items-center gap-2 rounded-lg border border-border/20 bg-card/50 p-2 text-xs">
                          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                          <span className="text-muted-foreground truncate">{item.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Bar Chart */}
            <motion.div variants={itemVariants}>
              <Card className="border-border/40 bg-gradient-to-br from-card via-card to-card/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Monthly comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <PerformanceChart data={analytics.chartData} />
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </>
  )
}
