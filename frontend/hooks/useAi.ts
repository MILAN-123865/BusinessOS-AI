import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sendChatMessageApi, getChatHistoryApi, getChatSessionsApi, deleteChatSessionApi } from '../api/ai'
import { AIChatRequest } from '../types/ai'

export const useAiChatHistory = (sessionId?: string | null) => {
  return useQuery({
    queryKey: ['ai-chat', sessionId],
    queryFn: () => getChatHistoryApi(sessionId!),
    enabled: !!sessionId,
    staleTime: 60000,
  })
}

export const useAiChatSessions = () => {
  return useQuery({
    queryKey: ['ai-sessions'],
    queryFn: getChatSessionsApi,
    staleTime: 60000,
  })
}

export const useSendAiMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AIChatRequest) => sendChatMessageApi(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-sessions'] })
      if (data.sessionId) {
        queryClient.invalidateQueries({ queryKey: ['ai-chat', data.sessionId] })
      }
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

export const useCreateAiSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_title?: string) => {
      const newSessionId = `session-${Date.now()}`
      return { id: newSessionId, title: _title || 'New Conversation', created_at: new Date().toISOString() }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-sessions'] })
    }
  })
}

export const useClearChat = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sessionId: string) => {
      await deleteChatSessionApi(sessionId)
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['ai-chat', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['ai-sessions'] })
    }
  })
}
