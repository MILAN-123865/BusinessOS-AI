import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTasksApi,
  getTaskApi,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  getTaskCommentsApi,
  createTaskCommentApi,
  deleteTaskCommentApi,
  getTaskSubtasksApi,
  createTaskSubtaskApi,
  updateTaskSubtaskApi,
  deleteTaskSubtaskApi,
} from '../api/task'
import { Task, Comment, Subtask } from '../types/task'

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: getTasksApi,
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => getTaskApi(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<Task>) => createTaskApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Task> }) =>
      updateTaskApi(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTaskApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// Comments
export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: ['taskComments', taskId],
    queryFn: () => getTaskCommentsApi(taskId),
    enabled: !!taskId,
  })
}

export function useCreateTaskComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: Partial<Comment> }) =>
      createTaskCommentApi(taskId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] })
      queryClient.invalidateQueries({ queryKey: ['taskComments', variables.taskId] })
    },
  })
}

export function useDeleteTaskComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, commentId }: { taskId: string; commentId: string }) =>
      deleteTaskCommentApi(taskId, commentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] })
      queryClient.invalidateQueries({ queryKey: ['taskComments', variables.taskId] })
    },
  })
}

// Subtasks
export function useTaskSubtasks(taskId: string) {
  return useQuery({
    queryKey: ['taskSubtasks', taskId],
    queryFn: () => getTaskSubtasksApi(taskId),
    enabled: !!taskId,
  })
}

export function useCreateTaskSubtask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: Partial<Subtask> }) =>
      createTaskSubtaskApi(taskId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] })
      queryClient.invalidateQueries({ queryKey: ['taskSubtasks', variables.taskId] })
    },
  })
}

export function useUpdateTaskSubtask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      taskId,
      subtaskId,
      payload,
    }: {
      taskId: string;
      subtaskId: string;
      payload: Partial<Subtask>;
    }) => updateTaskSubtaskApi(taskId, subtaskId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] })
      queryClient.invalidateQueries({ queryKey: ['taskSubtasks', variables.taskId] })
    },
  })
}

export function useDeleteTaskSubtask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) =>
      deleteTaskSubtaskApi(taskId, subtaskId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] })
      queryClient.invalidateQueries({ queryKey: ['taskSubtasks', variables.taskId] })
    },
  })
}
