export type ChatType = 'direct' | 'group' | 'department' | 'project'

export interface UserBasic {
  id: string
  first_name: string
  last_name: string
  avatar_url?: string
  is_online?: boolean
}

export interface ChatChannel {
  id: string
  name?: string // Null for DMs
  type: ChatType
  participants: UserBasic[]
  last_message?: ChatMessage
  unread_count: number
  created_at: string
  updated_at: string
}

export type MessageType = 'text' | 'image' | 'video' | 'file' | 'voice'

export interface MessageReaction {
  emoji: string
  user_ids: string[]
  count: number
}

export interface ChatMessage {
  id: string
  channel_id: string
  sender_id: string
  sender: UserBasic
  type: MessageType
  content: string
  file_url?: string
  file_name?: string
  file_size?: number
  is_edited: boolean
  is_deleted: boolean
  reactions: MessageReaction[]
  reply_to_id?: string
  reply_to_message?: ChatMessage
  mentions?: string[] // user IDs
  read_by?: string[] // user IDs
  created_at: string
  updated_at: string
}

export interface ChatListResponse {
  channels: ChatChannel[]
}

export interface ChatMessagesResponse {
  messages: ChatMessage[]
  next_cursor?: string
}

export interface SendMessagePayload {
  content: string
  type?: MessageType
  file_url?: string
  reply_to_id?: string
  mentions?: string[]
}
