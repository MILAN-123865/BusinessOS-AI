'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, TrendingUp, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, CheckCircle, HelpCircle } from 'lucide-react'
import { useAIInsights } from '@/hooks/useDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AIInsightsWidget() {
  const { data: insights, isLoading, isError, refetch, isRefetching } = useAIInsights()
  const [expandedTrend, setExpandedTrend] = useState<number | null>(null)

  const toggleTrend = (index: number) => {
    setExpandedTrend(expandedTrend === index ? null : index)
  }

  const getTrendStyles = (type: string) => {
    switch (type) {
      case 'positive':
        return {
          bg: 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/30',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: TrendingUp,
        }
      case 'negative':
      case 'warning':
        return {
          bg: 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20 hover:border-amber-500/30',
          text: 'text-amber-400',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: AlertTriangle,
        }
      default:
        return {
          bg: 'bg-slate-500/5 hover:bg-slate-500/10 border-slate-500/20 hover:border-slate-500/30',
          text: 'text-slate-300',
          badge: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
          icon: HelpCircle,
        }
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
      default:
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/25'
    }
  }

  if (isLoading) {
    return (
      <Card className="border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-accent/20 p-2 animate-pulse">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div className="space-y-1.5">
                <div className="h-5 w-40 bg-slate-700/60 rounded animate-pulse" />
                <div className="h-3.5 w-60 bg-slate-700/40 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="h-16 w-full bg-slate-800/40 rounded-xl animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-32 bg-slate-800/40 rounded-xl animate-pulse" />
            <div className="h-32 bg-slate-800/40 rounded-xl animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError || !insights) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 backdrop-blur-md overflow-hidden">
        <CardContent className="p-8 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-foreground">Failed to Load AI Insights</h3>
            <p className="text-sm text-muted-foreground">We were unable to synthesize telemetry for revenue and task analytics.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Generation
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-accent/10 bg-gradient-to-b from-[#111A2E]/50 to-[#0B1220]/50 backdrop-blur-md overflow-hidden shadow-xl transition-all duration-300 hover:border-accent/25">
      <CardHeader className="pb-4 border-b border-border/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center rounded-xl bg-accent/10 p-2.5">
              <span className="absolute inset-0 rounded-xl bg-accent/20 animate-ping opacity-30" />
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold tracking-tight text-foreground">AI Executive Insights</CardTitle>
                <Badge className="bg-accent/10 text-accent border border-accent/25 hover:bg-accent/10 text-[10px] px-1.5 py-0.5 tracking-wider uppercase font-semibold">
                  Live Analysis
                </Badge>
              </div>
              <CardDescription className="text-sm text-muted-foreground mt-0.5">
                Automatically highlighting critical revenue milestones and active task progression trends.
              </CardDescription>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="self-start sm:self-center flex items-center gap-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 disabled:opacity-50 px-4 py-2.5 text-xs font-semibold text-accent border border-accent/10 hover:border-accent/20 transition-all shadow-inner active:scale-95"
            id="refresh-insights-btn"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin text-accent' : ''}`} />
            <span>{isRefetching ? 'Analyzing...' : 'Re-analyze Metrics'}</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Executive Summary Block */}
        <div className="relative rounded-2xl bg-[#0F1829]/60 border border-border/45 p-5 shadow-inner">
          <div className="absolute top-3 right-3 text-accent/20">
            <Sparkles className="h-10 w-10" />
          </div>
          <p className="text-sm font-medium text-slate-300 leading-relaxed max-w-[95%]">
            <span className="font-bold text-accent">Summary Statement: </span>
            {insights.summary}
          </p>
        </div>

        {/* Significant Trends Section */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Significant Workspace Trends</h4>
          <div className="grid gap-4 md:grid-cols-3">
            {insights.trends.map((trend, i) => {
              const styles = getTrendStyles(trend.type)
              const Icon = styles.icon
              const isExpanded = expandedTrend === i

              return (
                <motion.div
                  key={i}
                  layout
                  transition={{ duration: 0.2 }}
                  className={`rounded-xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${styles.bg}`}
                  onClick={() => toggleTrend(i)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={`border-0 uppercase tracking-wider text-[9px] font-bold ${styles.badge}`}>
                        {trend.category}
                      </Badge>
                      <span className={styles.text}>
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-100 text-sm tracking-tight leading-tight">{trend.title}</h5>
                      <span className={`inline-block font-extrabold text-base tracking-tight ${styles.text}`}>
                        {trend.metric}
                      </span>
                    </div>

                    <p className={`text-xs text-slate-400 leading-normal ${isExpanded ? 'line-clamp-none' : 'line-clamp-2'}`}>
                      {trend.description}
                    </p>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 border-t border-border/10 mt-2 space-y-1.5"
                        >
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Impact</div>
                          <p className="text-xs text-slate-300 leading-normal font-medium italic">
                            {trend.impact}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/5 text-[10px] font-semibold text-slate-500">
                    <span>{isExpanded ? 'Collapse' : 'Expand Details'}</span>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Tactical Recommendations Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4.5 w-4.5 text-accent" />
            <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Actionable Recommendations</h4>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {insights.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border/30 bg-slate-900/40 p-4 hover:bg-slate-900/60 transition-colors"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 mt-0.5">
                  <span className="text-[10px] font-bold text-accent">{i + 1}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-200 text-sm leading-tight">{rec.title}</span>
                    <Badge className={`text-[9px] border-0 py-0 px-1.5 font-bold ${getPriorityBadge(rec.priority)}`}>
                      {rec.priority} Priority
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
