export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'APPROVE'

export interface AuditLog {
  id: string
  action: AuditAction
  resourceType: string
  resourceId?: string
  userId: string
  userEmail: string
  ipAddress: string
  details: Record<string, any>
  createdAt: string
}

export interface AuditLogFilter {
  startDate?: string
  endDate?: string
  action?: AuditAction
  userId?: string
  resourceType?: string
}

export interface AuditLogResponse {
  logs: AuditLog[]
  total: number
}
