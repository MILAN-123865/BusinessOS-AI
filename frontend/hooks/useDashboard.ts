import { useQuery } from '@tanstack/react-query'
import { getDashboardOverview, getAIInsights, getRecentActivities, getUpcomingEvents, getNotifications } from '../api/dashboard'

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: getDashboardOverview,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: true,
  })
}

export function useAIInsights() {
  return useQuery({
    queryKey: ['aiInsights'],
    queryFn: getAIInsights,
    staleTime: 1000 * 60 * 10, // 10 minutes (insights change slowly)
    gcTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
  })
}

export function useRecentActivities() {
  return useQuery({
    queryKey: ['recentActivities'],
    queryFn: getRecentActivities,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes cache
  })
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: getUpcomingEvents,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 20, // 20 minutes cache
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes cache
  })
}
