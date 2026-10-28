'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Bot,
  User,
  Zap,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Users,
  FolderOpen,
  MessageSquare,
  ArrowRight,
  Database,
  Loader2,
  Code2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppLayout } from '@/components/layout/app-layout'
import {
  useAiChatSessions,
  useAiChatHistory,
  useSendAiMessage,
  useDeleteAiSession,
} from '@/hooks/useAi'
import { useAuthStore } from '@/store/authStore'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

const QUICK_PROMPTS = [
  {
    icon: TrendingUp,
    label: 'Executive Briefing',
    prompt: 'Provide a full executive briefing with key KPIs, active headcount, projects, and financials.',
  },
  {
    icon: DollarSign,
    label: 'Financial Breakdown',
    prompt: 'Give me a detailed breakdown of paid revenue, pending invoices, and net profit margin.',
  },
  {
    icon: Database,
    label: 'Top Clients by Revenue',
    prompt: 'Show our client portfolio and enterprise accounts',
  },
  {
    icon: Code2,
    label: 'Run SQL Query',
    prompt: 'SQL: SELECT company_name, city, country FROM clients LIMIT 5',
  },
  {
    icon: CheckCircle2,
    label: 'Inspect Active Tasks',
    prompt: 'Show all open tasks, bottlenecks, and high priority items across the workspace.',
  },
  {
    icon: Zap,
    label: 'Create Action Item',
    prompt: 'Create task: Follow up with European distribution partners with High priority',
  },
]

export default function AiAssistantPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const user = useAuthStore((state) => state.user)

  const { data: sessions = [], isLoading: isLoadingSessions } = useAiChatSessions()
  const { data: messages = [], isLoading: isLoadingMessages } = useAiChatHistory(selectedSessionId)
  const sendMutation = useSendAiMessage()
  const deleteMutation = useDeleteAiSession()

  // Auto-select latest session if none selected and sessions exist
  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0].id)
    }
  }, [sessions, selectedSessionId])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sendMutation.isPending])

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || sendMutation.isPending) return

    setInputMessage('')
    try {
      const res = await sendMutation.mutateAsync({
        message: text,
        sessionId: selectedSessionId || undefined,
      })
      if (!selectedSessionId && res.sessionId) {
        setSelectedSessionId(res.sessionId)
      }
    } catch (err) {
      console.error('Failed to send AI message:', err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleStartNewChat = () => {
    setSelectedSessionId(null)
  }

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await deleteMutation.mutateAsync(id)
    if (selectedSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id)
      setSelectedSessionId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-7.5rem)] w-full gap-4 overflow-hidden">
        {/* Left Sidebar: Session Management */}
        <div className="hidden md:flex w-72 flex-col rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] shadow-xs overflow-hidden">
          {/* New Chat Button */}
          <div className="p-3 border-b border-sky-100 dark:border-sky-950">
            <button
              onClick={handleStartNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-700 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Session History List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Recent Sessions
            </div>
            {isLoadingSessions ? (
              <div className="flex items-center justify-center p-6 text-slate-400">
                <Loader2 size={18} className="animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No conversations yet. Start a new chat!
              </div>
            ) : (
              sessions.map((sess) => {
                const isActive = selectedSessionId === sess.id
                return (
                  <div
                    key={sess.id}
                    onClick={() => setSelectedSessionId(sess.id)}
                    className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-950/60 font-medium text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-sky-50/50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare size={13} className="shrink-0 text-sky-500" />
                      <span className="truncate">{sess.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(e, sess.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 rounded transition-opacity"
                      title="Delete chat"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* System Provider Badge */}
          <div className="p-3 border-t border-sky-100 dark:border-sky-950 bg-sky-50/40 dark:bg-[#070D1E]">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <Sparkles size={13} className="text-sky-600 dark:text-sky-400" />
              <span>Autonomous Copilot Engine</span>
            </div>
          </div>
        </div>

        {/* Main Conversation Window */}
        <div className="flex flex-1 flex-col rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] shadow-xs overflow-hidden">
          {/* Top Bar Header */}
          <div className="flex items-center justify-between border-b border-sky-100 dark:border-sky-950 px-4 py-3 bg-white/70 dark:bg-[#0B132B]/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-xs">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">BusinessOS AI Copilot</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Real-time database intelligence & executive action engine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStartNewChat}
                className="md:hidden flex items-center gap-1 rounded-lg border border-sky-200 dark:border-sky-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                <Plus size={13} />
                <span>New</span>
              </button>
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Database Connected
              </div>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50 dark:bg-[#070D1E]">
            {/* If new chat without messages, display quick prompt starter cards */}
            {(!selectedSessionId || messages.length === 0) && !isLoadingMessages && (
              <div className="mx-auto max-w-2xl py-6 text-center space-y-6">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 shadow-xs border border-sky-200 dark:border-sky-800">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    How can I assist your business today?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Ask questions across your entire company data, analyze financial cash flows, run SQL queries, or direct me to perform workspace actions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
                  {QUICK_PROMPTS.map((qp, idx) => {
                    const Icon = qp.icon
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(qp.prompt)}
                        className="group flex flex-col justify-between rounded-xl border border-sky-200/70 dark:border-sky-900/60 bg-white dark:bg-[#0F172A] p-3 hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/40 transition-all text-left cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300">
                            <Icon size={14} className="text-sky-500" />
                            {qp.label}
                          </span>
                          <ArrowRight size={13} className="text-slate-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-0.5" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                          {qp.prompt}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Render conversation thread */}
            {isLoadingMessages && selectedSessionId ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 size={24} className="animate-spin text-sky-600" />
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === 'user'
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${
                        isUser
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-sky-100 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-300'
                      }`}
                    >
                      {isUser ? <User size={15} /> : <Bot size={15} />}
                    </div>

                    <div
                      className={`max-w-[88%] md:max-w-[80%] rounded-2xl px-4 py-3 shadow-xs ${
                        isUser
                          ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-tr-xs font-medium'
                          : 'bg-white dark:bg-[#0F172A] border border-sky-100 dark:border-sky-900/60 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className={`text-[10px] font-semibold ${isUser ? 'text-sky-100' : 'text-slate-400 dark:text-slate-500'}`}>
                          {isUser ? (user ? `${user.first_name} ${user.last_name}` : 'You') : 'BusinessOS Copilot'}
                        </span>
                        <span className={`text-[10px] ${isUser ? 'text-sky-200' : 'text-slate-400 dark:text-slate-500'}`}>
                          {msg.timestamp}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {isUser ? (
                          <p className="text-xs md:text-sm whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <MarkdownRenderer content={msg.content} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}

            {/* Assistant Loading Indicator */}
            {sendMutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-300">
                  <Bot size={15} />
                </div>
                <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-[#0F172A] border border-sky-100 dark:border-sky-900/60 px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Loader2 size={13} className="animate-spin text-sky-600" />
                    <span>Querying live database & synthesizing insights...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 md:p-4 border-t border-sky-100 dark:border-sky-950 bg-white/80 dark:bg-[#0B132B]/80 backdrop-blur-sm">
            <div className="relative flex items-center rounded-xl border border-sky-200 dark:border-sky-900 bg-slate-50 dark:bg-[#070D1E] focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:bg-white dark:focus-within:bg-[#0F172A] transition-all">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything or enter 'SQL: SELECT...'..."
                rows={1}
                className="w-full resize-none bg-transparent px-3.5 py-3 text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none max-h-32"
              />
              <div className="flex items-center gap-1.5 pr-2">
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || sendMutation.isPending}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white disabled:opacity-40 hover:bg-sky-700 transition-all cursor-pointer shadow-xs"
                  title="Send message (Enter)"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-slate-400 dark:text-slate-500">
              <span>Press <kbd className="font-mono font-medium">Enter</kbd> to send, <kbd className="font-mono font-medium">Shift+Enter</kbd> for new line</span>
              <span className="flex items-center gap-1"><Database size={10} /> Live Text-to-SQL Engine Active</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
