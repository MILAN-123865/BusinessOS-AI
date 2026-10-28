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
import { TrendingUp, DollarSign, Users, PieChart as PieIcon, ArrowUpRight, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartData } from '@/types/dashboard'

const COLORFUL_BAR_PALETTE = [
  '#0284C7', // Sky Blue
  '#8B5CF6', // Royal Purple
  '#10B981', // Emerald Green
  '#F59E0B', // Vibrant Amber
  '#EC4899', // Hot Rose
  '#06B6D4', // Electric Cyan
  '#6366F1', // Deep Indigo
  '#F97316', // Bright Orange
]

const COLORFUL_DONUT_PALETTE = [
  '#0EA5E9', // Sky Blue
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#F43F5E', // Rose
  '#6366F1', // Indigo
  '#14B8A6', // Teal
]

export function DashboardCharts({ data }: { data: ChartData }) {
  const [isMounted, setIsMounted] = useState(false)
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'profit' | 'all'>('all')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-80 rounded-2xl bg-white dark:bg-[#131E3A] animate-pulse border border-[#E2E8F0] dark:border-[#202F54]" />
        <div className="h-80 rounded-2xl bg-white dark:bg-[#131E3A] animate-pulse border border-[#E2E8F0] dark:border-[#202F54]" />
        <div className="h-80 rounded-2xl bg-white dark:bg-[#131E3A] animate-pulse border border-[#E2E8F0] dark:border-[#202F54]" />
      </div>
    )
  }

  // Custom Glassmorphic Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-[#BAE6FD] dark:border-[#202F54] bg-white/95 dark:bg-[#131E3A]/95 p-3 shadow-xl text-xs space-y-1.5 min-w-[140px] backdrop-blur-md">
          <p className="font-bold text-[#0F172A] dark:text-slate-100 border-b border-[#E2E8F0] dark:border-[#202F54] pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-[#64748B] dark:text-slate-400">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-[#0F172A] dark:text-slate-100">
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
      {/* 1. Colorful Revenue & Profit Margin Velocity Area Chart */}
      <Card className="rounded-2xl border-[#E2E8F0] dark:border-[#202F54] bg-white dark:bg-[#131E3A] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white shadow-xs">
                <TrendingUp size={15} />
              </div>
              <div>
                <CardTitle className="text-sm font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
                  Financial Performance
                </CardTitle>
                <CardDescription className="text-[11px] text-[#64748B] dark:text-slate-400">
                  Cash flow & expenditure dynamics
                </CardDescription>
              </div>
            </div>
            {/* Metric Filter Tabs */}
            <div className="flex rounded-lg border border-[#E2E8F0] dark:border-[#202F54] bg-[#F8FAFC] dark:bg-[#0E1733] p-0.5 text-[10px]">
              <button
                onClick={() => setActiveMetric('all')}
                className={`rounded-md px-2 py-0.5 font-bold transition-all cursor-pointer ${
                  activeMetric === 'all'
                    ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white shadow-2xs'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveMetric('revenue')}
                className={`rounded-md px-2 py-0.5 font-bold transition-all cursor-pointer ${
                  activeMetric === 'revenue'
                    ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white shadow-2xs'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                Rev
              </button>
              <button
                onClick={() => setActiveMetric('profit')}
                className={`rounded-md px-2 py-0.5 font-bold transition-all cursor-pointer ${
                  activeMetric === 'profit'
                    ? 'bg-gradient-to-r from-[#10B981] to-[#34D399] text-white shadow-2xs'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                Profit
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenue_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* Colorful Gradients */}
                <linearGradient id="colorRevenueVibrant" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorExpensesVibrant" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#FB7185" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProfitVibrant" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.5} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CustomTooltip />} />
              
              {(activeMetric === 'all' || activeMetric === 'revenue') && (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#0284C7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenueVibrant)"
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#FFFFFF', fill: '#0284C7' }}
                />
              )}
              {activeMetric === 'all' && (
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorExpensesVibrant)"
                  strokeDasharray="4 4"
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#FFFFFF', fill: '#F43F5E' }}
                />
              )}
              {(activeMetric === 'all' || activeMetric === 'profit') && (
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorProfitVibrant)"
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#FFFFFF', fill: '#10B981' }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 2. Colorful Employee Headcount Bar Chart */}
      <Card className="rounded-2xl border-[#E2E8F0] dark:border-[#202F54] bg-white dark:bg-[#131E3A] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#C084FC] text-white shadow-xs">
                <Users size={15} />
              </div>
              <div>
                <CardTitle className="text-sm font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
                  Headcount Growth
                </CardTitle>
                <CardDescription className="text-[11px] text-[#64748B] dark:text-slate-400">
                  Quarterly talent acquisition
                </CardDescription>
              </div>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <ArrowUpRight size={11} />
              +14% YoY
            </span>
          </div>
        </CardHeader>

        <CardContent className="h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.employee_growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.5} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                name="Headcount"
                radius={[8, 8, 0, 0]}
                maxBarSize={36}
              >
                {data.employee_growth.map((entry, index) => (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={COLORFUL_BAR_PALETTE[index % COLORFUL_BAR_PALETTE.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. Colorful Project Portfolio Donut Chart */}
      <Card className="rounded-2xl border-[#E2E8F0] dark:border-[#202F54] bg-white dark:bg-[#131E3A] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] text-white shadow-xs">
                <PieIcon size={15} />
              </div>
              <div>
                <CardTitle className="text-sm font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
                  Project Portfolio
                </CardTitle>
                <CardDescription className="text-[11px] text-[#64748B] dark:text-slate-400">
                  Status allocation & lifecycle
                </CardDescription>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#0284C7] dark:text-sky-400 bg-[#E0F2FE] dark:bg-sky-950/60 px-2 py-0.5 rounded-lg border border-[#BAE6FD] dark:border-sky-800/60">
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
                paddingAngle={5}
                dataKey="value"
                stroke="transparent"
              >
                {data.projects_by_status.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORFUL_DONUT_PALETTE[index % COLORFUL_DONUT_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0]
                    return (
                      <div className="rounded-xl border border-[#BAE6FD] dark:border-[#202F54] bg-white dark:bg-[#131E3A] p-2.5 text-xs shadow-md">
                        <div className="flex items-center gap-1.5 font-bold text-[#0F172A] dark:text-slate-100">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.payload?.fill || item.color }} />
                          <span>{item.name}</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">{item.value} Projects</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(val) => <span className="text-[10px] text-[#475569] dark:text-slate-300 font-semibold">{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
