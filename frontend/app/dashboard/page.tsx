'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { TrendingUp, Users, FolderOpen, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

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
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

const hoverScale = { whileHover: { scale: 1.02, y: -2 }, transition: { duration: 0.2 } }

export default function DashboardPage() {
  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening across your business.</p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          variants={containerVariants}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { icon: Users, label: 'Active Employees', value: '248', trend: '+12%' },
            { icon: FolderOpen, label: 'Projects', value: '34', trend: '+5' },
            { icon: CheckCircle2, label: 'Completed Tasks', value: '1,204', trend: '+23%' },
            { icon: TrendingUp, label: 'Revenue', value: '$52.4K', trend: '+8.2%' },
          ].map((kpi, idx) => (
            <motion.div key={idx} variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
              <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-accent/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                      <p className="mt-2 text-3xl font-bold">{kpi.value}</p>
                      <Badge className="mt-3 bg-emerald-500/20 text-emerald-300 border-0">
                        {kpi.trend}
                      </Badge>
                    </div>
                    <div className="rounded-lg bg-primary/20 p-3">
                      <kpi.icon size={24} className="text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Content Grid */}
        <motion.div
          variants={containerVariants}
          className="grid gap-6 lg:grid-cols-3"
        >
          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'Project created', item: 'Q3 Marketing Campaign', time: '2 hours ago' },
                    { action: 'Task completed', item: 'Design new landing page', time: '5 hours ago' },
                    { action: 'Document shared', item: 'Q3 Strategy Document', time: '1 day ago' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-4 rounded-lg border border-border/40 bg-card/40 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                        <CheckCircle2 size={20} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.item}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: 'Review designs', date: 'Tomorrow', icon: Clock },
                    { title: 'Client meeting', date: 'Wed, 12 Jun', icon: AlertCircle },
                    { title: 'Submit proposal', date: 'Thu, 13 Jun', icon: CheckCircle2 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/40 p-3">
                      <item.icon size={18} className="text-accent" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Analytics Preview */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Monthly trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-lg border border-border/40 bg-card/40 flex items-center justify-center text-muted-foreground">
                Charts component will be rendered here
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}
