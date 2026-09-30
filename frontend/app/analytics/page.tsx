'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  DollarSign,
  Users,
  Eye,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  Activity,
} from 'lucide-react'
import { useAnalyticsData, useExportAnalytics } from '@/hooks/useAnalytics'
import { AnalyticsFilterParams } from '@/types/analytics'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6']

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsFilterParams['period']>('month')
  const [activeChartTab, setActiveChartTab] = useState<'revenue' | 'profit' | 'expenses'>('revenue')

  const { data: analytics, isLoading, isError, refetch } = useAnalyticsData({ period })
  const exportAnalytics = useExportAnalytics()

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    exportAnalytics.mutate({ format, params: { period } })
  }

  // Custom Glassmorphic Tooltip
  const CustomAnalyticsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[150px]">
          <p className="font-semibold text-foreground/90 border-b border-border/40 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-semibold text-foreground">
                {typeof entry.value === 'number'
                  ? entry.name.toLowerCase().includes('count') || entry.name.toLowerCase().includes('visitors')
                    ? entry.value.toLocaleString()
                    : `$${Number(entry.value).toLocaleString()}`
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-12"
      >
        {/* Header Bar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-5"
        >
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BarChart3 size={18} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Enterprise Analytics & Insights
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time revenue velocity, cash flow trends, and workforce efficiency metrics.
            </p>
          </div>

          {/* Controls & Export */}
          <div className="flex items-center gap-2.5">
            {/* Period Selector Tabs */}
            <div className="flex rounded-xl border border-border/60 bg-card p-1 shadow-2xs">
              {[
                { id: 'month', label: '30 Days' },
                { id: 'quarter', label: 'Quarter' },
                { id: 'year', label: 'Year' },
                { id: 'all_time', label: 'All Time' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPeriod(t.id as any)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    period === t.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleExport('csv')}
              disabled={exportAnalytics.isPending || isLoading}
              className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 py-2 text-xs font-medium text-foreground shadow-2xs hover:bg-muted transition-all cursor-pointer disabled:opacity-50"
            >
              {exportAnalytics.isPending ? (
                <Loader2 size={14} className="animate-spin text-primary" />
              ) : (
                <Download size={14} className="text-primary" />
              )}
              <span>Export CSV</span>
            </button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-xs font-medium">Synthesizing enterprise telemetry data...</p>
          </div>
        ) : isError || !analytics ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive text-sm font-semibold">Failed to fetch live analytics telemetry.</p>
            <button
              onClick={() => refetch()}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <motion.div
              variants={containerVariants}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {[
                {
                  label: 'Gross Realized Revenue',
                  value: `$${Number(analytics.revenue || 0).toLocaleString()}`,
                  change: '+18.4%',
                  isPositive: true,
                  icon: DollarSign,
                  color: 'text-indigo-500 bg-indigo-500/10',
                },
                {
                  label: 'Net Operating Profit',
                  value: `$${Number(analytics.profit || 0).toLocaleString()}`,
                  change: '+12.1%',
                  isPositive: true,
                  icon: TrendingUp,
                  color: 'text-emerald-500 bg-emerald-500/10',
                },
                {
                  label: 'Total Operating Expenses',
                  value: `$${Number(analytics.expenses || 0).toLocaleString()}`,
                  change: '-3.2%',
                  isPositive: false,
                  icon: CreditCard,
                  color: 'text-rose-500 bg-rose-500/10',
                },
                {
                  label: 'Total Platform Traffic',
                  value: Number(analytics.visitors || 0).toLocaleString(),
                  change: '+24.8%',
                  isPositive: true,
                  icon: Eye,
                  color: 'text-amber-500 bg-amber-500/10',
                },
              ].map((kpi, idx) => {
                const Icon = kpi.icon
                return (
                  <motion.div key={idx} variants={itemVariants}>
                    <Card className="rounded-2xl border-border/50 bg-card/60 shadow-xs backdrop-blur-xs p-4 hover:border-primary/40 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {kpi.label}
                        </span>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${kpi.color}`}>
                          <Icon size={16} />
                        </div>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-xl font-bold tracking-tight text-foreground font-mono">
                          {kpi.value}
                        </span>
                        <span
                          className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            kpi.isPositive
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-rose-500/10 text-rose-600'
                          }`}
                        >
                          {kpi.isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                          {kpi.change}
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Main Interactive Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Primary Large Area & Trendline Chart (2 Cols) */}
              <Card className="lg:col-span-2 rounded-2xl border-border/60 bg-card/60 shadow-xs backdrop-blur-xs overflow-hidden flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Activity size={16} className="text-primary" />
                        Cash Flow & Revenue Velocity Dynamics
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Real-time revenue versus burn-rate curve
                      </CardDescription>
                    </div>

                    {/* Chart Metric Switcher */}
                    <div className="flex rounded-xl border border-border/60 bg-muted/30 p-0.5 text-xs">
                      {[
                        { id: 'revenue', label: 'Revenue' },
                        { id: 'profit', label: 'Net Profit' },
                        { id: 'expenses', label: 'Expenses' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveChartTab(tab.id as any)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                            activeChartTab === tab.id
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="h-80 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analytics.charts_data}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="areaColorPrimary" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="areaColorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="areaColorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                      />
                      <Tooltip content={<CustomAnalyticsTooltip />} />

                      {activeChartTab === 'revenue' && (
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke="#6366F1"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#areaColorPrimary)"
                          activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }}
                        />
                      )}

                      {activeChartTab === 'profit' && (
                        <Area
                          type="monotone"
                          dataKey="profit"
                          name="Net Profit"
                          stroke="#10B981"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#areaColorProfit)"
                          activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }}
                        />
                      )}

                      {activeChartTab === 'expenses' && (
                        <Area
                          type="monotone"
                          dataKey="expenses"
                          name="Expenses"
                          stroke="#F43F5E"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#areaColorExpenses)"
                          activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Traffic Acquisition & Geography Breakdown (1 Col) */}
              <Card className="rounded-2xl border-border/60 bg-card/60 shadow-xs backdrop-blur-xs overflow-hidden flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                        <PieIcon size={16} className="text-amber-500" />
                        Traffic Channels
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        User acquisition distribution
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="h-80 pt-2 flex flex-col justify-between">
                  <div className="h-44 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Organic Search', value: 45 },
                            { name: 'Direct Referral', value: 28 },
                            { name: 'Paid Social', value: 17 },
                            { name: 'Email Campaign', value: 10 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={46}
                          outerRadius={68}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {[0, 1, 2, 3].map((i) => (
                            <Cell key={`c-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0]
                              return (
                                <div className="rounded-xl border border-border bg-background p-2 text-xs shadow-md">
                                  <span className="font-semibold">{item.name}</span>: {item.value}%
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Acquisition Progress Bars */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    {[
                      { label: 'Organic Search', pct: 45, color: 'bg-indigo-500' },
                      { label: 'Direct Referral', pct: 28, color: 'bg-emerald-500' },
                      { label: 'Paid Social', pct: 17, color: 'bg-amber-500' },
                      { label: 'Email Campaign', pct: 10, color: 'bg-pink-500' },
                    ].map((channel, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{channel.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full ${channel.color}`} style={{ width: `${channel.pct}%` }} />
                          </div>
                          <span className="font-mono font-semibold text-foreground w-7 text-right">
                            {channel.pct}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </motion.div>
    </AppLayout>
  )
}
