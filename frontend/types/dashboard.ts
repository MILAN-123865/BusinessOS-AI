export interface MetricItem {
  title: string
  value: number
  change: number
  trend: 'up' | 'down'
}

export interface MetricOverview {
  active_employees: MetricItem
  active_projects: MetricItem
  completed_tasks: MetricItem
  revenue: MetricItem
}

export interface ChartData {
  revenue_trend: { name: string; revenue: number; expenses: number }[]
  employee_growth: { name: string; count: number }[]
  projects_by_status: { name: string; value: number }[]
}

export interface DashboardOverviewResponse {
  metrics: MetricOverview
  charts: ChartData
}

export interface Activity {
  id: string
  type: 'project' | 'employee' | 'task'
  title: string
  description: string
  timestamp: string
  user: string
}

export interface UpcomingEvent {
  id: string
  type: 'meeting' | 'deadline' | 'review' | 'presentation'
  title: string
  date: string
  organizer: string
}

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  timestamp: string
}

export interface AIInsightTrend {
  category: 'revenue' | 'tasks'
  type: 'positive' | 'negative' | 'warning' | 'neutral'
  title: string
  metric: string
  description: string
  impact: string
}

export interface AIInsightRecommendation {
  title: string
  description: string
  priority: 'High' | 'Medium' | 'Low'
}

export interface AIInsightsData {
  trends: AIInsightTrend[]
  recommendations: AIInsightRecommendation[]
  summary: string
}

