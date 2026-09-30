'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, X, Minimize2, Maximize2, Loader2, Bot, User, CornerDownLeft } from 'lucide-react'
import { useSendAiMessage } from '@/hooks/useAi'
import { AIMessage } from '@/types/ai'

const QUICK_PROMPTS = [
  'Show today\'s revenue & expenses',
  'What are our active projects?',
  'List pending tasks and deadlines',
  'Give me an organization overview',
]

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your BusinessOS AI Copilot. Ask me anything about your projects, financials, employees, or tasks.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sendAiMessage = useSendAiMessage()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
    }
  }, [messages, isOpen, isMinimized])

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query || sendAiMessage.isPending) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')

    sendAiMessage.mutate(
      { message: query, sessionId },
      {
        onSuccess: (response: any) => {
          const respMsg = response?.message || {
            id: Date.now().toString(),
            role: 'assistant',
            content: response?.content || response?.data?.content || 'Completed successfully.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
          setMessages((prev) => [...prev, respMsg])
          if (!sessionId && response?.sessionId) {
            setSessionId(response.sessionId)
          }
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: 'I encountered an issue processing your query against the database.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ])
        },
      }
    )
  }

  return (
    <>
      {/* Floating Launcher Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#7C3AED] px-4 py-2.5 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30 cursor-pointer hover:bg-[#6D28D9] transition-all"
            title="Ask AI Copilot"
          >
            <Sparkles size={16} />
            <span className="text-xs font-semibold tracking-wide">Ask AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 z-50 flex w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl transition-all ${
              isMinimized ? 'h-14' : 'h-[560px]'
            }`}
          >
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-[#F8FAFC] px-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-[#7C3AED]">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#111827]">BusinessOS Copilot</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                    <span className="text-[10px] text-[#6B7280]">Connected to Workspace</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="rounded-lg p-1.5 text-[#6B7280] hover:bg-slate-200 hover:text-[#111827] transition-all cursor-pointer"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-[#6B7280] hover:bg-red-50 hover:text-[#DC2626] transition-all cursor-pointer"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-white">
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user'
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-[#7C3AED]">
                            <Bot size={14} />
                          </div>
                        )}
                        <div
                          className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                            isUser
                              ? 'bg-[#4F46E5] text-white rounded-br-xs font-medium shadow-2xs'
                              : 'bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] rounded-bl-xs'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <span
                            className={`mt-1 block text-[9px] ${
                              isUser ? 'text-indigo-200' : 'text-[#9CA3AF]'
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>
                        {isUser && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#111827]">
                            <User size={14} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {sendAiMessage.isPending && (
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-[#7C3AED]">
                        <Bot size={14} />
                      </div>
                      <div className="flex items-center gap-1.5 rounded-2xl bg-[#F8FAFC] px-3 py-2 border border-[#E5E7EB]">
                        <Loader2 size={12} className="animate-spin text-[#7C3AED]" />
                        <span className="text-[11px]">Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestions */}
                {messages.length <= 2 && (
                  <div className="px-3 pb-2 bg-white">
                    <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      Suggested
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleSendMessage(prompt)}
                          className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1 text-[11px] text-[#6B7280] transition-all hover:border-[#7C3AED]/50 hover:bg-purple-50 hover:text-[#7C3AED] cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Bar */}
                <div className="shrink-0 border-t border-[#E5E7EB] bg-[#F8FAFC] p-3">
                  <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 focus-within:border-[#7C3AED] focus-within:ring-1 focus-within:ring-[#7C3AED] transition-all shadow-2xs">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask copilot anything..."
                      disabled={sendAiMessage.isPending}
                      className="flex-1 bg-transparent text-xs text-[#111827] placeholder:text-[#9CA3AF] outline-none"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={sendAiMessage.isPending || !input.trim()}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7C3AED] text-white transition-all hover:bg-[#6D28D9] disabled:opacity-40 cursor-pointer"
                    >
                      {sendAiMessage.isPending ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <CornerDownLeft size={13} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
