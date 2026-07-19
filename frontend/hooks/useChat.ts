import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import {
  getChatChannelsApi,
  getChatMessagesApi,
  sendChatMessageApi,
  updateChatMessageApi,
  deleteChatMessageApi,
  addMessageReactionApi
} from '../api/chat'
import { SendMessagePayload } from '../types/chat'

export const useChatChannels = () => {
  return useQuery({
    queryKey: ['chat-channels'],
    queryFn: getChatChannelsApi,
    refetchInterval: 15000, // Poll every 15s
  })
}

export const useChatMessages = (channelId: string) => {
  return useInfiniteQuery({
    queryKey: ['chat-messages', channelId],
    queryFn: ({ pageParam }) => getChatMessagesApi(channelId, pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage.next_cursor || undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!channelId,
    refetchInterval: 5000, // Poll active chat frequently
  })
}

export const useSendChatMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ channelId, payload }: { channelId: string; payload: SendMessagePayload }) => 
      sendChatMessageApi(channelId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.channelId] })
      queryClient.invalidateQueries({ queryKey: ['chat-channels'] })
    },
  })
}

export const useUpdateChatMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) => 
      updateChatMessageApi(messageId, content),
    onSuccess: () => {
      // Typically we'd invalidate the specific message list or channel list
      // For simplicity, we just trigger refetches on the current channel if we know it
      // but without channelId in response, we might just rely on polling or global invalidation
    },
  })
}

export const useDeleteChatMessage = () => {
  return useMutation({
    mutationFn: deleteChatMessageApi,
  })
}

export const useAddReaction = () => {
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) => 
      addMessageReactionApi(messageId, emoji),
  })
}
