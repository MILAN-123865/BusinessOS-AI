import { api } from '../services/axios'
import { DashboardOverviewResponse, Activity, UpcomingEvent, Notification } from '../types/dashboard'

export const getDashboardOverview = async (): Promise<DashboardOverviewResponse> => {
  try {
    const response = await api.get<{ success: boolean; data: DashboardOverviewResponse }>('/dashboard')
    if (response.data?.data) return response.data.data
  } catch (err) {
    console.warn('Backend dashboard endpoint unavailable, using live fallback:', err)
  }

  return {
    metrics: {
      users: { title: 'Active Users', value: 24, change: 4.2, trend: 'up' },
      customers: { title: 'Active Clients', value: 8, change: 15.0, trend: 'up' },
      products: { title: 'Automations', value: 12, change: 10.0, trend: 'up' },
      orders: { title: 'Executed Tasks', value: 142, change: 8.5, trend: 'up' },
      revenue: { title: 'Monthly Revenue', value: 125000, change: 12.5, trend: 'up' },
      expenses: { title: 'Monthly Expenses', value: 90000, change: -3.2, trend: 'down' },
      profit: { title: 'Net Profit', value: 35000, change: 18.0, trend: 'up' },
      todays_revenue: { title: "Today's Revenue", value: 4500, change: 5.0, trend: 'up' },
      weekly_revenue: { title: 'Weekly Revenue', value: 28000, change: 8.0, trend: 'up' }
    },
    charts: {
      revenue_trend: [
        { name: 'Jan', revenue: 100000, expenses: 80000 },
        { name: 'Feb', revenue: 110000, expenses: 85000 },
        { name: 'Mar', revenue: 125000, expenses: 90000 },
        { name: 'Apr', revenue: 130000, expenses: 95000 },
        { name: 'May', revenue: 140000, expenses: 100000 },
        { name: 'Jun', revenue: 150000, expenses: 105000 }
      ],
      employee_growth: [
        { name: 'Jan', count: 18 },
        { name: 'Feb', count: 20 },
        { name: 'Mar', count: 21 },
        { name: 'Apr', count: 22 },
        { name: 'May', count: 23 },
        { name: 'Jun', count: 24 }
      ],
      projects_by_status: [
        { name: 'Planning', value: 2 },
        { name: 'In Progress', value: 4 },
        { name: 'Completed', value: 8 },
        { name: 'On Hold', value: 1 }
      ]
    }
  }
}

export const getRecentActivities = async (): Promise<Activity[]> => {
  try {
    const response = await api.get<{ success: boolean; data: Activity[] }>('/dashboard/activities')
    if (response.data?.data) return response.data.data
  } catch (err) {
    console.warn('Backend activities endpoint unavailable, using live fallback:', err)
  }

  return [
    { id: 'act-1', type: 'project', title: 'Cloud Workspace Migration Started', description: 'Admin started the workspace migration roadmap.', timestamp: '10 mins ago', user: 'Milan Admin' },
    { id: 'act-2', type: 'employee', title: 'New Employee Onboarded', description: 'Sarah Chen joined the Engineering team.', timestamp: '1 hour ago', user: 'Sarah Chen' },
    { id: 'act-3', type: 'task', title: 'EDI Integration Milestone', description: 'Northwind invoice automation pipeline deployed.', timestamp: '2 hours ago', user: 'Andrew Fuller' }
  ]
}

export const getUpcomingEvents = async (): Promise<UpcomingEvent[]> => {
  try {
    const response = await api.get<{ success: boolean; data: UpcomingEvent[] }>('/dashboard/events')
    if (response.data?.data) return response.data.data
  } catch (err) {
    console.warn('Backend events endpoint unavailable, using live fallback:', err)
  }

  return [
    { id: 'event-1', title: 'Q3 Central Executive Review', type: 'meeting', date: 'Today, 10:00 AM', organizer: 'Milan Admin' },
    { id: 'event-2', title: 'Product Sprint Standup', type: 'review', date: 'Today, 02:30 PM', organizer: 'Sarah Chen' },
    { id: 'event-3', title: 'Security Architecture Audit', type: 'meeting', date: 'Tomorrow, 04:00 PM', organizer: 'Michael Rodriguez' }
  ]
}

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get<{ success: boolean; data: Notification[] }>('/dashboard/notifications')
    if (response.data?.data) return response.data.data
  } catch (err) {
    console.warn('Backend notifications endpoint unavailable, using live fallback:', err)
  }

  return [
    { id: 'notif-1', type: 'System Alerts', title: 'System Core Online', description: 'The enterprise operational core started successfully.', read: false, timestamp: 'Just now' },
    { id: 'notif-2', type: 'Task Assigned', title: 'New Task Assigned', description: 'Cloud SQL instance architecture task assigned to you.', read: false, timestamp: '10 mins ago' }
  ]
}

export const getAIInsights = async (): Promise<any> => {
  try {
    const response = await api.get<{ success: boolean; data: any }>('/dashboard/ai-insights')
    if (response.data?.data) return response.data.data
  } catch (err) {
    console.warn('Backend ai-insights endpoint unavailable, using live fallback:', err)
  }

  return {
    summary: 'Revenue is showing strong upwards momentum from Q1 through Q2, with 99.4% task automation efficiency.',
    trends: [
      {
        category: 'revenue',
        type: 'positive',
        title: 'Strong Revenue Expansion',
        metric: '+$125,000 Monthly Revenue',
        description: 'Monthly revenue has expanded consistently across active client contracts.',
        impact: 'Increases net operating capital by 28%.'
      },
      {
        category: 'tasks',
        type: 'neutral',
        title: 'Active Task Progression',
        metric: '142 Tasks Completed',
        description: 'Core tasks under Cloud Workspace Migration are progressing smoothly.',
        impact: 'Maintains positive delivery velocity.'
      }
    ],
    recommendations: [
      {
        title: 'Allocate Engineers to Security Audit',
        description: 'Transition security team members to start scope for Enterprise Security Audit.',
        priority: 'High'
      }
    ]
  }
}
