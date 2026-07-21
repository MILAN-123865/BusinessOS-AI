import { api } from '../services/axios'
import { Workflow, WorkflowCreateData, WorkflowStatus, WorkflowExecution } from '../types/workflow'

export const getWorkflowsApi = async (): Promise<Workflow[]> => {
  const response = await api.get<{ success: boolean; data: Workflow[] }>('/workflows')
  return response.data.data
}

export const getWorkflowApi = async (id: string): Promise<Workflow> => {
  const response = await api.get<{ success: boolean; data: Workflow }>(`/workflows/${id}`)
  return response.data.data
}

export const createWorkflowApi = async (data: WorkflowCreateData): Promise<Workflow> => {
  const response = await api.post<{ success: boolean; data: Workflow }>('/workflows', data)
  return response.data.data
}

export const updateWorkflowStatusApi = async (id: string, status: WorkflowStatus): Promise<Workflow> => {
  const response = await api.patch<{ success: boolean; data: Workflow }>(`/workflows/${id}/status`, { status })
  return response.data.data
}

export const runWorkflowApi = async (id: string): Promise<Workflow> => {
  const response = await api.post<{ success: boolean; data: Workflow }>(`/workflows/${id}/run`)
  return response.data.data
}

export const getWorkflowExecutionsApi = async (workflowId: string): Promise<WorkflowExecution[]> => {
  const response = await api.get<{ success: boolean; data: WorkflowExecution[] }>(`/workflows/${workflowId}/executions`)
  return response.data.data
}
