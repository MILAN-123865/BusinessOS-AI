import { AIChatRequest, AIChatResponse, AIMessage, AIChatSession } from '../types/ai'

let mockSessions: AIChatSession[] = [
  { id: 'session-1', title: 'General Chat', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
]

let mockMessages: Record<string, AIMessage[]> = {
  'session-1': []
}

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms))

export const sendChatMessageApi = async (data: AIChatRequest): Promise<AIChatResponse> => {
  const sessionId = data.sessionId || `session-${Date.now()}`

  if (!mockMessages[sessionId]) {
    mockMessages[sessionId] = []
  }

  const userMsg: AIMessage = {
    id: `msg-${Date.now()}`,
    role: 'user',
    content: data.message,
    timestamp: new Date().toLocaleTimeString(),
  }

  // Push user message to history optimistically
  mockMessages[sessionId].push(userMsg)

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: data.message,
        history: mockMessages[sessionId].slice(0, -1), // Send all history except the latest user message we just pushed
        systemInstruction: data.systemInstruction,
        model: data.model
      })
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'API Error')
    }

    const responseData = await res.json()

    const aiMsg: AIMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: responseData.message,
      timestamp: new Date().toLocaleTimeString(),
    }

    mockMessages[sessionId].push(aiMsg)

    return {
      message: aiMsg,
      sessionId: sessionId
    }
  } catch (error: any) {
    console.error("AI Generation Error:", error)
    const errorMsg: AIMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: `**Error:** Failed to connect to Gemini API. \n\n*Details: ${error.message}*`,
      timestamp: new Date().toLocaleTimeString(),
    }
    mockMessages[sessionId].push(errorMsg)
    return {
      message: errorMsg,
      sessionId: sessionId
    }
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
