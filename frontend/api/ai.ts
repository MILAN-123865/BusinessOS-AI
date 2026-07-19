import { api } from '../services/axios'
import { AIChatRequest, AIChatResponse, AIMessage, AIChatSession } from '../types/ai'

export const sendChatMessageApi = async (data: AIChatRequest): Promise<AIChatResponse> => {
  const response = await api.post<{ success: boolean; data: AIChatResponse }>('/ai/chat', data)
  return response.data.data
}

export const getChatHistoryApi = async (sessionId: string): Promise<AIMessage[]> => {
  const response = await api.get<{ success: boolean; data: AIMessage[] }>(`/ai/chat/${sessionId}`)
  return response.data.data
}

export const getChatSessionsApi = async (): Promise<AIChatSession[]> => {
  const response = await api.get<{ success: boolean; data: AIChatSession[] }>('/ai/sessions')
  return response.data.data
}
