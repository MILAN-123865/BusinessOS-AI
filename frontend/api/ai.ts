import { AIChatRequest, AIChatResponse, AIMessage, AIChatSession } from '../types/ai'

let mockSessions: AIChatSession[] = [
  { id: 'session-1', title: 'General Chat', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
]

let mockMessages: Record<string, AIMessage[]> = {
  'session-1': []
}

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms))

export const sendChatMessageApi = async (data: AIChatRequest): Promise<AIChatResponse> => {
  await simulateDelay(1500) // Simulated AI delay

  if (!mockMessages[data.sessionId]) {
    mockMessages[data.sessionId] = []
  }

  const userMsg: AIMessage = {
    id: `msg-${Date.now()}`,
    role: 'user',
    content: data.message,
    timestamp: new Date().toLocaleTimeString(),
    sessionId: data.sessionId
  }

  const aiMsg: AIMessage = {
    id: `msg-${Date.now() + 1}`,
    role: 'assistant',
    content: `Here is a simulated response to: "${data.message}"\n\n\`\`\`javascript\nconsole.log("Hello from AI!");\n\`\`\`\n\nI can also format **markdown**!`,
    timestamp: new Date().toLocaleTimeString(),
    sessionId: data.sessionId
  }

  mockMessages[data.sessionId].push(userMsg, aiMsg)

  return {
    success: true,
    message: aiMsg.content,
    sessionId: data.sessionId,
    usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
  }
}

export const getChatHistoryApi = async (sessionId: string): Promise<AIMessage[]> => {
  await simulateDelay(300)
  return mockMessages[sessionId] || []
}

export const getChatSessionsApi = async (): Promise<AIChatSession[]> => {
  await simulateDelay(300)
  return mockSessions
}

export const createChatSessionApi = async (title: string): Promise<AIChatSession> => {
  await simulateDelay(300)
  const newSession: AIChatSession = {
    id: `session-${Date.now()}`,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  mockSessions.unshift(newSession)
  mockMessages[newSession.id] = []
  return newSession
}

export const deleteChatSessionApi = async (sessionId: string): Promise<{ success: boolean }> => {
  await simulateDelay(300)
  mockSessions = mockSessions.filter(s => s.id !== sessionId)
  delete mockMessages[sessionId]
  return { success: true }
}

export const clearChatApi = async (sessionId: string): Promise<{ success: boolean }> => {
  await simulateDelay(300)
  mockMessages[sessionId] = []
  return { success: true }
}
