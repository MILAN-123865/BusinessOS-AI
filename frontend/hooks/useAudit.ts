import { useQuery, useMutation } from '@tanstack/react-query'
import { getAuditLogsApi, exportAuditLogsApi } from '../api/audit'
import { AuditLogFilter } from '../types/audit'

export const useAuditLogs = (filters?: AuditLogFilter, page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['audit-logs', filters, page, limit],
    queryFn: () => getAuditLogsApi(filters, page, limit),
    staleTime: 10000,
  })
}

export const useExportAuditLogs = () => {
  return useMutation({
    mutationFn: (filters?: AuditLogFilter) => exportAuditLogsApi(filters),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }
  })
}
