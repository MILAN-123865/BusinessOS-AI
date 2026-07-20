import { api } from '../services/axios'
import { Task, Comment, Subtask } from '../types/task'

export const getTasksApi = async (): Promise<Task[]> => {
  const response = await api.get<{ success: boolean; data: Task[] }>('/tasks')
  return response.data.data
}

export const getTaskApi = async (id: string): Promise<Task> => {
  const response = await api.get<{ success: boolean; data: Task }>(`/tasks/${id}`)
  return response.data.data
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
