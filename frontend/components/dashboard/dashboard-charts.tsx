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
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartData } from '@/types/dashboard'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

export function DashboardCharts({ data }: { data: ChartData }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-80 rounded-xl bg-card/40 animate-pulse border border-border/40" />
        <div className="h-80 rounded-xl bg-card/40 animate-pulse border border-border/40" />
        <div className="h-80 rounded-xl bg-card/40 animate-pulse border border-border/40" />
      </div>
    )
  }

  const revenueTrend = data?.revenue_trend || []
  const employeeGrowth = data?.employee_growth || []
  const projectsByStatus = data?.projects_by_status || []

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Revenue Trend Area Chart */}
      <Card className="border-border/40 bg-card/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Revenue vs Expenses</CardTitle>
          <CardDescription>Monthly growth overview</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                labelStyle={{ color: '#9CA3AF', fontSize: 12 }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} isAnimationActive={false} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Employee Growth Bar Chart */}
      <Card className="border-border/40 bg-card/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Employee Growth</CardTitle>
          <CardDescription>Onboarded count over time</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={employeeGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                labelStyle={{ color: '#9CA3AF', fontSize: 12 }}
              />
              <Bar dataKey="count" name="Employees" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Projects Status Pie Chart */}
      <Card className="border-border/40 bg-card/30 backdrop-blur-md md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Projects by Status</CardTitle>
          <CardDescription>Active structural status</CardDescription>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center">
          <div className="w-full h-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectsByStatus}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {projectsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: 12 }}
                />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingBottom: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
