export type AIMessageRole = 'user' | 'assistant' | 'system'

export interface AIMessage {
  id: string
  role: AIMessageRole
  content: string
  timestamp: string
}

export interface AIChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface AIChatRequest {
  message: string
  sessionId?: string
  model?: string
  systemInstruction?: string
}

export interface AIChatResponse {
  message: AIMessage
  sessionId: string
}
