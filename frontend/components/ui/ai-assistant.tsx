'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Loader2,
  Bot,
  User,
  CornerDownLeft,
  Database,
  Search,
  Package,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'
import { useSendAiMessage } from '@/hooks/useAi'
import { AIMessage } from '@/types/ai'
import { MarkdownRenderer } from './markdown-renderer'

const QUICK_PROMPTS = [
  { label: 'Executive Briefing', prompt: 'Executive overview of workspace' },
  { label: 'Low Stock Inventory', prompt: 'Which products are low in stock?' },
  { label: 'Top Clients', prompt: 'Show our client portfolio and enterprise accounts' },
  { label: 'SQL Query Clients', prompt: 'SQL: SELECT company_name, city, country FROM clients LIMIT 5' },
  { label: 'Financial Health', prompt: 'Give me our revenue and financial breakdown' },
  { label: 'Create Action Task', prompt: 'Create task: Follow up with European distribution partners with High priority' },
]

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '### ⚡ BusinessOS AI Copilot\n\nI am connected to your live operational database. You can ask for real-time analytics, run **read-only SQL queries**, inspect **clients & inventory**, or ask me to **create tasks** automatically.',
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
  }, [messages, isOpen, isMinimized, sendAiMessage.isPending])

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
          const respMsg: AIMessage = response?.message || {
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
        onError: (err: any) => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: '### ⚠️ Connection Notice\n\nUnable to reach the AI engine or live database service. Please ensure the backend server is running.',
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
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-white shadow-xl shadow-sky-500/25 border border-sky-300/40 cursor-pointer hover:from-sky-600 hover:to-blue-700 transition-all group"
            title="Open BusinessOS AI Copilot"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
              <Sparkles size={13} className="text-white animate-pulse" />
            </div>
            <span className="text-xs font-semibold tracking-wide">Live AI Copilot</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 z-50 flex w-[480px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] shadow-2xl transition-all ${
              isMinimized ? 'h-14' : 'h-[620px]'
            }`}
          >
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-sky-100 dark:border-sky-950 bg-gradient-to-r from-sky-50 via-white to-sky-50 dark:from-[#0f172a] dark:to-[#0B132B] px-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  <Bot size={17} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">BusinessOS AI Copilot</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 border border-emerald-200 dark:border-emerald-800 text-[9px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <Database size={8} /> Live SQL
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Grounded in live database</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-sky-100/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-all cursor-pointer"
                  title="Close"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs bg-slate-50/50 dark:bg-[#070D1E]">
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user'
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shadow-2xs">
                            <Bot size={14} />
                          </div>
                        )}
                        <div
                          className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs shadow-xs ${
                            isUser
                              ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-xs font-medium'
                              : 'bg-white dark:bg-[#0F172A] border border-sky-100 dark:border-sky-900/60 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <MarkdownRenderer content={msg.content} />
                          )}
                          <span
                            className={`mt-1.5 block text-[9px] ${
                              isUser ? 'text-sky-100' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>
                        {isUser && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white shadow-2xs">
                            <User size={14} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {sendAiMessage.isPending && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        <Bot size={14} />
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl bg-white dark:bg-[#0F172A] px-3.5 py-2 border border-sky-100 dark:border-sky-900/60 shadow-xs">
                        <Loader2 size={13} className="animate-spin text-sky-600 dark:text-sky-400" />
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Introspecting live database...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Preset Suggestions */}
                <div className="px-3 py-2 bg-white dark:bg-[#0B132B] border-t border-sky-100 dark:border-sky-950">
                  <div className="flex items-center justify-between pb-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Live Queries & Actions
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                    {QUICK_PROMPTS.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(item.prompt)}
                        disabled={sendAiMessage.isPending}
                        className="rounded-lg border border-sky-200/70 dark:border-sky-900/70 bg-sky-50/60 dark:bg-sky-950/40 px-2 py-0.5 text-[11px] font-medium text-sky-800 dark:text-sky-300 transition-all hover:border-sky-400 hover:bg-sky-100/70 dark:hover:bg-sky-900/50 cursor-pointer disabled:opacity-50"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Bar */}
                <div className="shrink-0 border-t border-sky-100 dark:border-sky-950 bg-slate-50 dark:bg-[#070D1E] p-3">
                  <div className="flex items-center gap-2 rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-[#0F172A] px-3 py-1.5 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all shadow-xs">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask copilot or enter 'SQL: SELECT...'..."
                      disabled={sendAiMessage.isPending}
                      className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={sendAiMessage.isPending || !input.trim()}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white transition-all hover:bg-sky-700 disabled:opacity-40 cursor-pointer"
                      title="Send message"
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
