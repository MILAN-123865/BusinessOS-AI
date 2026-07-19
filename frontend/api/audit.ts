import { api } from '../services/axios'
import { AuditLogResponse, AuditLogFilter } from '../types/audit'

export const getAuditLogsApi = async (filters?: AuditLogFilter, page = 1, limit = 50): Promise<AuditLogResponse> => {
  const response = await api.get<{ success: boolean; data: AuditLogResponse }>('/audit-logs', {
    params: { ...filters, page, limit }
  })
  return response.data.data
}

export const exportAuditLogsApi = async (filters?: AuditLogFilter): Promise<Blob> => {
  const response = await api.get('/audit-logs/export', {
    params: filters,
    responseType: 'blob'
  })
  return response.data
}
