import { api } from '../services/axios'
import { ChatChannel, ChatMessage, ChatListResponse, ChatMessagesResponse, SendMessagePayload } from '../types/chat'

export const getChatChannelsApi = async (): Promise<ChatChannel[]> => {
  const response = await api.get<{ success: boolean; data: ChatListResponse }>('/chats')
  return response.data.data.channels
}

export const getChatMessagesApi = async (channelId: string, cursor?: string): Promise<ChatMessagesResponse> => {
  const response = await api.get<{ success: boolean; data: ChatMessagesResponse }>(`/chats/${channelId}/messages`, {
    params: { cursor }
  })
  return response.data.data
}

export const sendChatMessageApi = async (channelId: string, payload: SendMessagePayload): Promise<ChatMessage> => {
  const response = await api.post<{ success: boolean; data: ChatMessage }>(`/chats/${channelId}/messages`, payload)
  return response.data.data
}

export const updateChatMessageApi = async (messageId: string, content: string): Promise<ChatMessage> => {
  const response = await api.patch<{ success: boolean; data: ChatMessage }>(`/messages/${messageId}`, { content })
  return response.data.data
}

export const deleteChatMessageApi = async (messageId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/messages/${messageId}`)
  return response.data
}

export const addMessageReactionApi = async (messageId: string, emoji: string): Promise<ChatMessage> => {
  const response = await api.post<{ success: boolean; data: ChatMessage }>(`/messages/${messageId}/reactions`, { emoji })
  return response.data.data
}
