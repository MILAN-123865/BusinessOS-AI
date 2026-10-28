import { useQuery } from '@tanstack/react-query'
import { getDashboardOverview, getRecentActivities, getUpcomingEvents, getNotifications, getAIInsights } from '../api/dashboard'

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: getDashboardOverview,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  })
}

export function useRecentActivities() {
  return useQuery({
    queryKey: ['recentActivities'],
    queryFn: getRecentActivities,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: getUpcomingEvents,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useAIInsights() {
  return useQuery({
    queryKey: ['aiInsights'],
    queryFn: getAIInsights,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
