import { AnalyticsData, AnalyticsFilterParams } from '../types/analytics'

const mockData: AnalyticsData = {
  kpis: [
    { label: 'Total Revenue', value: '$128,430', change: '+12.5%', trend: 'up' },
    { label: 'Active Clients', value: '1,249', change: '+3.2%', trend: 'up' },
    { label: 'Churn Rate', value: '2.4%', change: '-0.8%', trend: 'down' },
    { label: 'Customer LTV', value: '$4,320', change: '+5.1%', trend: 'up' },
  ],
  chartData: [
    { month: 'Jan', revenue: 4000, expenses: 2400, profit: 1600 },
    { month: 'Feb', revenue: 3000, expenses: 1398, profit: 1602 },
    { month: 'Mar', revenue: 2000, expenses: 9800, profit: -7800 },
    { month: 'Apr', revenue: 2780, expenses: 3908, profit: -1128 },
    { month: 'May', revenue: 1890, expenses: 4800, profit: -2910 },
    { month: 'Jun', revenue: 2390, expenses: 3800, profit: -1410 },
    { month: 'Jul', revenue: 3490, expenses: 4300, profit: -810 },
  ],
  taskDistribution: [
    { name: 'Completed', value: 45, fill: '#22c55e' },
    { name: 'In Progress', value: 30, fill: '#3b82f6' },
    { name: 'Pending Review', value: 15, fill: '#f59e0b' },
    { name: 'Blocked', value: 10, fill: '#ef4444' },
  ]
}

export const getAnalyticsDataApi = async (params?: AnalyticsFilterParams): Promise<AnalyticsData> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockData), 800))
}

export const exportAnalyticsReportApi = async (format: 'pdf' | 'csv' | 'excel', params?: AnalyticsFilterParams): Promise<Blob> => {
  return new Promise((resolve) => setTimeout(() => resolve(new Blob()), 1000))
}
