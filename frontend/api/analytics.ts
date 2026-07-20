import { api } from '../services/axios'
import { AnalyticsData, AnalyticsFilterParams } from '../types/analytics'

export const getAnalyticsDataApi = async (params?: AnalyticsFilterParams): Promise<AnalyticsData> => {
  const response = await api.get<{ success: boolean; data: AnalyticsData }>('/analytics', { params })
  return response.data.data
}

export const exportAnalyticsReportApi = async (format: 'pdf' | 'csv' | 'excel', params?: AnalyticsFilterParams): Promise<Blob> => {
  const response = await api.get(`/analytics/export/${format}`, {
    params,
    responseType: 'blob'
  })
  return response.data
}
