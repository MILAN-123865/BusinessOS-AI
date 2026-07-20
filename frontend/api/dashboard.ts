import { api } from '../services/axios'
import { DashboardOverviewResponse, Activity, UpcomingEvent, Notification, AIInsightsData } from '../types/dashboard'

export const getDashboardOverview = async (): Promise<DashboardOverviewResponse> => {
  const response = await api.get<{ success: boolean; data: DashboardOverviewResponse }>('/dashboard/overview')
  return response.data.data
}

export const getAIInsights = async (): Promise<AIInsightsData> => {
  const response = await api.get<{ success: boolean; data: AIInsightsData }>('/dashboard/ai-insights')
  return response.data.data
}

export const getRecentActivities = async (): Promise<Activity[]> => {
  const response = await api.get<{ success: boolean; data: Activity[] }>('/dashboard/activities')
  return response.data.data
}

export const getUpcomingEvents = async (): Promise<UpcomingEvent[]> => {
  const response = await api.get<{ success: boolean; data: UpcomingEvent[] }>('/dashboard/events')
  return response.data.data
}

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get<{ success: boolean; data: Notification[] }>('/dashboard/notifications')
  return response.data.data
}
