export interface MetricItem {
  title: string
  value: number
  change: number
  trend: 'up' | 'down'
}

export interface MetricOverview {
  users: MetricItem
  customers: MetricItem
  products: MetricItem
  orders: MetricItem
  revenue: MetricItem
  expenses: MetricItem
  profit: MetricItem
  todays_revenue: MetricItem
  weekly_revenue: MetricItem
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
  type: string
  title: string
  description: string
  read: boolean
  timestamp: string
}
