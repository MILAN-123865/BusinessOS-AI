'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, X, Zap, Minimize2, Maximize2, Loader2 } from 'lucide-react'
import { useSendAiMessage } from '@/hooks/useAi'
import { AIMessage } from '@/types/ai'

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your Enterprise AI assistant. How can I help you today?',
      timestamp: new Date().toLocaleTimeString(),
    },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sendAiMessage = useSendAiMessage()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (input.trim() && !sendAiMessage.isPending) {
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, userMessage])
      
      const currentInput = input
      setInput('')

      sendAiMessage.mutate({ message: currentInput, sessionId }, {
        onSuccess: (response) => {
          setMessages((prev) => [...prev, response.message])
          if (!sessionId) {
            setSessionId(response.sessionId)
          }
        },
        onError: (error) => {
          setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Sorry, I encountered an error while processing your request.',
            timestamp: new Date().toLocaleTimeString(),
          }])
        }
      })
    }
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            whileHover={{ scale: 1.1, rotateZ: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 rounded-full bg-primary/20 p-4 text-accent hover:bg-primary/30 shadow-lg backdrop-blur-sm"
          >
            <Zap size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-6 right-6 z-40 w-96 max-w-sm rounded-lg border border-border/40 bg-card shadow-2xl flex flex-col overflow-hidden"
            style={{ height: isMinimized ? '56px' : '600px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 bg-card/40 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                  <Zap size={18} className="text-accent" />
                </div>
                <span className="font-semibold">AI Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="rounded-lg p-1.5 hover:bg-card/60 text-muted-foreground hover:text-foreground"
                >
                  {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-card/60 text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin">
                  {messages.map((message, idx) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.15 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-primary/20 text-accent'
                            : 'bg-card/60 border border-border/40 text-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        <span className="mt-1 block text-xs text-muted-foreground/60">{message.timestamp}</span>
                      </div>
                    </motion.div>
                  ))}
                  {sendAiMessage.isPending && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[85%] rounded-lg px-4 py-3 bg-card/60 border border-border/40 text-foreground flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-accent" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-border/40 bg-card/40 p-3 backdrop-blur-sm">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything..."
                      disabled={sendAiMessage.isPending}
                      className="flex-1 rounded-lg border border-border/40 bg-card/60 px-3 py-2 text-sm outline-none focus:border-accent disabled:opacity-50"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={sendAiMessage.isPending || !input.trim()}
                      className="rounded-lg bg-primary/20 p-2 text-accent hover:bg-primary/30 disabled:opacity-50"
                    >
                      {sendAiMessage.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </motion.button>
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
