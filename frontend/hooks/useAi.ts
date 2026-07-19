import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sendChatMessageApi, getChatHistoryApi, getChatSessionsApi } from '../api/ai'
import { AIChatRequest } from '../types/ai'

export const useAiChatHistory = (sessionId?: string) => {
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
    staleTime: 300000, // 5 minutes
  })
}

export const useSendAiMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AIChatRequest) => sendChatMessageApi(data),
    onSuccess: (data) => {
      if (data.sessionId) {
        queryClient.invalidateQueries({ queryKey: ['ai-chat', data.sessionId] })
      }
    }
  })
}
