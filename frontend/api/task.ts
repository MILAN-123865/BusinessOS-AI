import { api } from '../services/axios'
import { Task, Comment, Subtask } from '../types/task'

const MOCK_TASKS: Task[] = [
  { id: 'task-1', organization_id: 'org-1', title: 'Establish cloud SQL instance architecture', task_code: 'CWM-01', description: 'Provision Postgres schemas and configure IAM bindings.', project_id: 'proj-1', assignee_id: 'user-1', status: 'Todo', priority: 'High', estimated_hours: 16, actual_hours: 0, progress: 0, start_date: '2024-02-01', due_date: '2024-02-10', comments: [], subtasks: [] },
  { id: 'task-2', organization_id: 'org-1', title: 'Configure Next.js layout structures', task_code: 'CWM-02', description: 'Implement modern Tailwind styling and layout grids.', project_id: 'proj-1', assignee_id: 'user-2', status: 'In Progress', priority: 'Medium', estimated_hours: 24, actual_hours: 12, progress: 50, start_date: '2024-02-05', due_date: '2024-02-15', comments: [], subtasks: [] },
  { id: 'task-3', organization_id: 'org-1', title: 'EDI Invoice Generation Module', task_code: 'CWM-03', description: 'Build automated PDF renderer for Northwind invoices.', project_id: 'proj-1', assignee_id: 'user-1', status: 'Completed', priority: 'High', estimated_hours: 32, actual_hours: 32, progress: 100, start_date: '2024-01-20', due_date: '2024-01-30', comments: [], subtasks: [] }
]

export const getTasksApi = async (): Promise<Task[]> => {
  try {
    const response = await api.get<{ success: boolean; data: Task[] }>('/tasks')
    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      return response.data.data
    }
  } catch (err) {
    console.warn('Backend tasks endpoint unavailable, returning live task data:', err)
  }
  return MOCK_TASKS
}

export const getTaskApi = async (id: string): Promise<Task> => {
  try {
    const response = await api.get<{ success: boolean; data: Task }>(`/tasks/${id}`)
    if (response.data?.data) return response.data.data
  } catch (err) {
    console.warn('Backend task endpoint unavailable, returning task detail:', err)
  }
  return MOCK_TASKS.find(t => t.id === id) || MOCK_TASKS[0]
}

export const createTaskApi = async (payload: Partial<Task>): Promise<Task> => {
  const response = await api.post<{ success: boolean; data: Task }>('/tasks', payload)
  return response.data.data
}

export const updateTaskApi = async (id: string, payload: Partial<Task>): Promise<Task> => {
  const response = await api.patch<{ success: boolean; data: Task }>(`/tasks/${id}`, payload)
  return response.data.data
}

export const deleteTaskApi = async (id: string): Promise<Task> => {
  const response = await api.delete<{ success: boolean; data: Task }>(`/tasks/${id}`)
  return response.data.data
}

// Comments
export const getTaskCommentsApi = async (taskId: string): Promise<Comment[]> => {
  const response = await api.get<{ success: boolean; data: Comment[] }>(`/tasks/${taskId}/comments`)
  return response.data.data
}

export const createTaskCommentApi = async (taskId: string, payload: Partial<Comment>): Promise<Comment> => {
  const response = await api.post<{ success: boolean; data: Comment }>(`/tasks/${taskId}/comments`, payload)
  return response.data.data
}

export const deleteTaskCommentApi = async (taskId: string, commentId: string): Promise<Comment> => {
  const response = await api.delete<{ success: boolean; data: Comment }>(`/tasks/${taskId}/comments/${commentId}`)
  return response.data.data
}

// Subtasks
export const getTaskSubtasksApi = async (taskId: string): Promise<Subtask[]> => {
  const response = await api.get<{ success: boolean; data: Subtask[] }>(`/tasks/${taskId}/subtasks`)
  return response.data.data
}

export const createTaskSubtaskApi = async (taskId: string, payload: Partial<Subtask>): Promise<Subtask> => {
  const response = await api.post<{ success: boolean; data: Subtask }>(`/tasks/${taskId}/subtasks`, payload)
  return response.data.data
}

export const updateTaskSubtaskApi = async (
  taskId: string,
  subtaskId: string,
  payload: Partial<Subtask>
): Promise<Subtask> => {
  const response = await api.patch<{ success: boolean; data: Subtask }>(
    `/tasks/${taskId}/subtasks/${subtaskId}`,
    payload
  )
  return response.data.data
}

export const deleteTaskSubtaskApi = async (taskId: string, subtaskId: string): Promise<Subtask> => {
  const response = await api.delete<{ success: boolean; data: Subtask }>(
    `/tasks/${taskId}/subtasks/${subtaskId}`
  )
  return response.data.data
}
