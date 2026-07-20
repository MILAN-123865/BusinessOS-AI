export type WorkflowStatus = 'ACTIVE' | 'DRAFT' | 'PAUSED' | 'FAILED'

export interface WorkflowTrigger {
  type: string // e.g. 'ON_DOCUMENT_CREATED', 'ON_STATUS_CHANGE', 'SCHEDULED'
  config: Record<string, any>
}

export interface WorkflowAction {
  id: string
  type: string // e.g. 'SEND_EMAIL', 'CREATE_TASK', 'UPDATE_RECORD', 'HTTP_REQUEST'
  config: Record<string, any>
  nextActionId?: string
}

export interface Workflow {
  id: string
  name: string
  description?: string
  status: WorkflowStatus
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  createdBy: string
  createdAt: string
  updatedAt: string
  lastRunAt?: string
  executionCount: number
  successRate: number
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'SUCCESS' | 'FAILED' | 'RUNNING'
  startedAt: string
  completedAt?: string
  logs: string[]
}

export interface WorkflowCreateData {
  name: string
  description?: string
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
}
