import { useQuery, useMutation } from '@tanstack/react-query'
import { getAnalyticsDataApi, exportAnalyticsReportApi } from '../api/analytics'
import { AnalyticsFilterParams } from '../types/analytics'

export const useAnalyticsData = (params?: AnalyticsFilterParams) => {
  return useQuery({
    queryKey: ['analytics', params],
    queryFn: () => getAnalyticsDataApi(params),
    staleTime: 60000, // 1 minute stale time
    gcTime: 300000, // 5 minutes cache time (gcTime in React Query v5)
  })
}

export const useExportAnalytics = () => {
  return useMutation({
    mutationFn: ({ format, params }: { format: 'pdf' | 'csv' | 'excel', params?: AnalyticsFilterParams }) => 
      exportAnalyticsReportApi(format, params),
    onSuccess: (blob, variables) => {
      // Trigger download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics_report_${new Date().getTime()}.${variables.format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }
  })
}
