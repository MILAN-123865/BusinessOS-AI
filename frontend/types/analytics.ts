export interface ChartDataPoint {
  month: string
  revenue: number
  expenses: number
  profit: number
}

export interface TaskDistributionPoint {
  name: string
  value: number
  fill: string
}

export interface KPIMetric {
  label: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
}

export interface AnalyticsData {
  kpis: KPIMetric[]
  chartData: ChartDataPoint[]
  taskDistribution: TaskDistributionPoint[]
}

export interface AnalyticsFilterParams {
  period: 'month' | 'quarter' | 'year' | 'all_time'
  departmentId?: string
  projectId?: string
}
