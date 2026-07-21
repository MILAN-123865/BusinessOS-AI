import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sendChatMessageApi, getChatHistoryApi, getChatSessionsApi, createChatSessionApi, deleteChatSessionApi, clearChatApi } from '../api/ai'
import { AIChatRequest } from '../types/ai'

export const useAiChatHistory = (sessionId?: string) => {
  return useQuery({
    queryKey: ['ai-chat', sessionId],
    queryFn: () => getChatHistoryApi(sessionId!),
    enabled: !!sessionId,
    staleTime: 1000, // Make staleTime very short for more reactive chats
  })
}

export const useAiChatSessions = () => {
  return useQuery({
    queryKey: ['ai-sessions'],
    queryFn: getChatSessionsApi,
    staleTime: 5000, // 5 seconds
  })
}

export const useSendAiMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AIChatRequest) => sendChatMessageApi(data),
    onSuccess: (data) => {
      if (data.sessionId) {
        queryClient.invalidateQueries({ queryKey: ['ai-chat', data.sessionId] })
        queryClient.invalidateQueries({ queryKey: ['ai-sessions'] })
      }
    }
  })
}

export const useCreateAiSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => createChatSessionApi(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-sessions'] })
    }
  })
}

export const useDeleteAiSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => deleteChatSessionApi(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-sessions'] })
    }
  })
}

export const useClearChat = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => clearChatApi(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['ai-chat', sessionId] })
    }
  })
}
