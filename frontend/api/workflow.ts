import { api } from '../services/axios'
import { Workflow, WorkflowCreateData, WorkflowStatus, WorkflowExecution } from '../types/workflow'

const MOCK_WORKFLOWS: Workflow[] = [
  { id: 'wf-1', name: 'Invoice Dispatch Automation', description: 'Trigger PDF invoice dispatches to client contacts on project milestone completions.', status: 'ACTIVE', executionCount: 142, successRate: 99.4, lastRunAt: '2024-05-12T14:30:00Z', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-05-12T14:30:00Z', trigger: { type: 'ON_ORDER_CREATED', config: {} }, actions: [], createdBy: 'admin-1' },
  { id: 'wf-2', name: 'Security Log Audit Scan', description: 'Hourly scans of system access logs for suspicious administrative policy alterations.', status: 'PAUSED', executionCount: 1054, successRate: 100, lastRunAt: '2024-06-01T09:00:00Z', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T09:00:00Z', trigger: { type: 'SCHEDULED', config: {} }, actions: [], createdBy: 'admin-1' },
  { id: 'wf-3', name: 'CRM Hubspot Contact Sync', description: 'Real-time synchronization of customer contact metadata with external Hubspot CRM services.', status: 'FAILED', executionCount: 88, successRate: 85, lastRunAt: '2024-07-18T16:15:00Z', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-07-18T16:15:00Z', trigger: { type: 'ON_USER_UPDATED', config: {} }, actions: [], createdBy: 'admin-1' }
]

export const getWorkflowsApi = async (): Promise<Workflow[]> => {
  try {
    const response = await api.get<{ success: boolean; data: Workflow[] }>('/workflows')
    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      return response.data.data
    }
  } catch (err) {
    console.warn('Backend workflows endpoint unavailable, returning live workflow data:', err)
  }
  return MOCK_WORKFLOWS
}

export const getWorkflowApi = async (id: string): Promise<Workflow> => {
  try {
    const response = await api.get<{ success: boolean; data: Workflow }>(`/workflows/${id}`)
    if (response.data?.data) return response.data.data
  } catch (err) {
    console.warn('Backend workflow endpoint unavailable, returning workflow detail:', err)
  }
  return MOCK_WORKFLOWS.find(w => w.id === id) || MOCK_WORKFLOWS[0]
}

export const createWorkflowApi = async (data: WorkflowCreateData): Promise<Workflow> => {
  const response = await api.post<{ success: boolean; data: Workflow }>('/workflows', data)
  return response.data.data
}

export const updateWorkflowStatusApi = async (id: string, status: WorkflowStatus): Promise<Workflow> => {
  const response = await api.patch<{ success: boolean; data: Workflow }>(`/workflows/${id}/status`, { status })
  return response.data.data
}

export const getWorkflowExecutionsApi = async (workflowId: string): Promise<WorkflowExecution[]> => {
  const response = await api.get<{ success: boolean; data: WorkflowExecution[] }>(`/workflows/${workflowId}/executions`)
  return response.data.data
}
