'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, X, Zap, Minimize2, Maximize2 } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: string
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I&apos;m your AI assistant. How can I help you today?',
      timestamp: new Date().toLocaleTimeString(),
    },
  ])
  const [input, setInput] = useState('')

  const handleSendMessage = () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: input,
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages([...messages, userMessage])

      // Simulate assistant response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'I&apos;m processing your request. This is a demo response.',
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }, 400)

      setInput('')
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
                <div className="flex-1 overflow-y-auto space-y-4 p-4">
                  {messages.map((message, idx) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.15 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-4 py-2 ${
                          message.type === 'user'
                            ? 'bg-primary/20 text-accent'
                            : 'bg-card/60 border border-border/40 text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="mt-1 block text-xs text-muted-foreground/60">{message.timestamp}</span>
                      </div>
                    </motion.div>
                  ))}
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
                      className="flex-1 rounded-lg border border-border/40 bg-card/60 px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      className="rounded-lg bg-primary/20 p-2 text-accent hover:bg-primary/30"
                    >
                      <Send size={18} />
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
