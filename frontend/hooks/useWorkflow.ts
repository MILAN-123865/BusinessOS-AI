import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWorkflowsApi, getWorkflowApi, createWorkflowApi, updateWorkflowStatusApi, getWorkflowExecutionsApi } from '../api/workflow'
import { WorkflowCreateData, WorkflowStatus } from '../types/workflow'

export const useWorkflows = () => {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: getWorkflowsApi,
  })
}

export const useWorkflow = (id: string) => {
  return useQuery({
    queryKey: ['workflow', id],
    queryFn: () => getWorkflowApi(id),
    enabled: !!id,
  })
}

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WorkflowCreateData) => createWorkflowApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    }
  })
}

export const useUpdateWorkflowStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string, status: WorkflowStatus }) => updateWorkflowStatusApi(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      queryClient.invalidateQueries({ queryKey: ['workflow', data.id] })
    }
  })
}

export const useWorkflowExecutions = (workflowId: string) => {
  return useQuery({
    queryKey: ['workflow-executions', workflowId],
    queryFn: () => getWorkflowExecutionsApi(workflowId),
    enabled: !!workflowId,
    refetchInterval: 10000, // Poll for execution updates
  })
}
