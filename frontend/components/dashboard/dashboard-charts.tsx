'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Users, PieChart as PieIcon, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartData } from '@/types/dashboard'

const DONUT_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6']

export function DashboardCharts({ data }: { data: ChartData }) {
  const [isMounted, setIsMounted] = useState(false)
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'profit' | 'all'>('all')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-80 rounded-2xl bg-card/40 animate-pulse border border-border/40" />
        <div className="h-80 rounded-2xl bg-card/40 animate-pulse border border-border/40" />
        <div className="h-80 rounded-2xl bg-card/40 animate-pulse border border-border/40" />
      </div>
    )
  }

  // Custom Glassmorphic Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[140px]">
          <p className="font-semibold text-foreground/90 border-b border-border/40 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-semibold text-foreground">
                {typeof entry.value === 'number' && entry.name.toLowerCase().includes('count')
                  ? entry.value
                  : `$${Number(entry.value).toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const projectsTotal = data.projects_by_status.reduce((acc, p) => acc + (p.value || 0), 0)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* 1. Revenue & Profit Margin Velocity Area Chart */}
      <Card className="rounded-2xl border-border/60 bg-card/60 shadow-xs backdrop-blur-xs flex flex-col justify-between overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                <TrendingUp size={15} />
              </div>
              <div>
                <CardTitle className="text-sm font-bold tracking-tight text-foreground">
                  Financial Performance
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Cash flow & expenditure dynamics
                </CardDescription>
              </div>
            </div>
            {/* Metric Filter Tabs */}
            <div className="flex rounded-lg border border-border/60 bg-muted/40 p-0.5 text-[10px]">
              <button
                onClick={() => setActiveMetric('all')}
                className={`rounded-md px-2 py-0.5 font-medium transition-all ${
                  activeMetric === 'all' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveMetric('revenue')}
                className={`rounded-md px-2 py-0.5 font-medium transition-all ${
                  activeMetric === 'revenue' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Rev
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenue_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CustomTooltip />} />
              
              {(activeMetric === 'all' || activeMetric === 'revenue') && (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
                />
              )}
              {activeMetric === 'all' && (
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                  strokeDasharray="3 3"
                />
              )}
              {(activeMetric === 'all' || activeMetric === 'profit') && (
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 2. Employee Headcount Trajectory Bar Chart */}
      <Card className="rounded-2xl border-border/60 bg-card/60 shadow-xs backdrop-blur-xs flex flex-col justify-between overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Users size={15} />
              </div>
              <div>
                <CardTitle className="text-sm font-bold tracking-tight text-foreground">
                  Headcount Growth
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Quarterly talent acquisition
                </CardDescription>
              </div>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
              <ArrowUpRight size={11} />
              +14% YoY
            </span>
          </div>
        </CardHeader>

        <CardContent className="h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.employee_growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                name="Headcount"
                fill="url(#barGrowth)"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. Project Distribution Donut Chart */}
      <Card className="rounded-2xl border-border/60 bg-card/60 shadow-xs backdrop-blur-xs flex flex-col justify-between overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <PieIcon size={15} />
              </div>
              <div>
                <CardTitle className="text-sm font-bold tracking-tight text-foreground">
                  Project Portfolio
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Status allocation & lifecycle
                </CardDescription>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold text-foreground">
              {projectsTotal} Projects
            </span>
          </div>
        </CardHeader>

        <CardContent className="h-64 pt-2 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.projects_by_status}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={4}
                dataKey="value"
                stroke="transparent"
              >
                {data.projects_by_status.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0]
                    return (
                      <div className="rounded-xl border border-border bg-background/95 p-2.5 text-xs shadow-md">
                        <span className="font-semibold text-foreground">{item.name}</span>: {item.value} Projects
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={7}
                formatter={(val) => <span className="text-[10px] text-muted-foreground">{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
