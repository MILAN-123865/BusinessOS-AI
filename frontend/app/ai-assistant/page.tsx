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
  ShieldAlert,
  Loader2,
  CornerDownLeft,
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
    icon: CheckCircle2,
    label: 'Inspect Active Tasks',
    prompt: 'Show all open tasks, bottlenecks, and high priority items across the workspace.',
  },
  {
    icon: FolderOpen,
    label: 'Project Portfolio',
    prompt: 'What is the status of our project portfolio and budget allocations?',
  },
  {
    icon: Users,
    label: 'Team Directory Audit',
    prompt: 'Summarize our active team structure, department count, and staffing.',
  },
  {
    icon: Zap,
    label: 'Create Action Item',
    prompt: 'Create task: Schedule executive team sync for Friday with High priority',
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

  // Format markdown helper (tables, code blocks, bold, headers)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let inTable = false
    let tableRows: string[][] = []
    let isHeader = true

    const flushTable = () => {
      if (tableRows.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-xl border border-border/60 shadow-xs">
            <table className="w-full border-collapse text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/50 font-semibold text-foreground">
                  {tableRows[0].map((cell, idx) => (
                    <th key={idx} className="px-3 py-2">
                      {cell.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {tableRows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-muted/20 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        tableRows = []
        inTable = false
      }
    }

    lines.forEach((line, idx) => {
      const trimmed = line.trim()

      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true
        // Ignore markdown divider line | :--- | :--- |
        if (trimmed.includes('---')) return
        const cols = trimmed.slice(1, -1).split('|')
        tableRows.push(cols)
        return
      } else if (inTable) {
        flushTable()
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="mt-3 mb-1.5 text-base font-bold text-foreground">
            {trimmed.replace('### ', '')}
          </h3>
        )
      } else if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={idx} className="mt-2 mb-1 text-sm font-semibold text-foreground">
            {trimmed.replace('#### ', '')}
          </h4>
        )
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const text = trimmed.replace(/^[-•]\s*/, '')
        elements.push(
          <li key={idx} className="ml-4 list-disc text-xs md:text-sm leading-relaxed text-foreground/90">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(text) }} />
          </li>
        )
      } else if (trimmed === '') {
        elements.push(<div key={idx} className="h-1.5" />)
      } else {
        elements.push(
          <p key={idx} className="text-xs md:text-sm leading-relaxed text-foreground/90">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
          </p>
        )
      }
    })

    if (inTable) flushTable()
    return elements
  }

  const formatInlineMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-foreground/80">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-primary">$1</code>')
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-7.5rem)] w-full gap-4 overflow-hidden">
        {/* Left Sidebar: Session Management */}
        <div className="hidden md:flex w-72 flex-col rounded-2xl border border-border/50 bg-card shadow-xs overflow-hidden">
          {/* New Chat Button */}
          <div className="p-3 border-b border-border/50">
            <button
              onClick={handleStartNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Session History List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
            <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Sessions
            </div>
            {isLoadingSessions ? (
              <div className="flex items-center justify-center p-6 text-muted-foreground">
                <Loader2 size={18} className="animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
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
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare size={13} className="shrink-0" />
                      <span className="truncate">{sess.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(e, sess.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive rounded transition-opacity"
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
          <div className="p-3 border-t border-border/50 bg-muted/30">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Sparkles size={13} className="text-primary" />
              <span>Autonomous Copilot Engine</span>
            </div>
          </div>
        </div>

        {/* Main Conversation Window */}
        <div className="flex flex-1 flex-col rounded-2xl border border-border/50 bg-card shadow-xs overflow-hidden">
          {/* Top Bar Header */}
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-card/60 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-xs">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">BusinessOS AI Copilot</h2>
                <p className="text-[11px] text-muted-foreground">
                  Real-time database intelligence & executive action engine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStartNewChat}
                className="md:hidden flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground"
              >
                <Plus size={13} />
                <span>New</span>
              </button>
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Database Connected
              </div>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {/* If new chat without messages, display quick prompt starter cards */}
            {(!selectedSessionId || messages.length === 0) && !isLoadingMessages && (
              <div className="mx-auto max-w-2xl py-6 text-center space-y-6">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    How can I assist your business today?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    Ask questions across your entire company data, analyze financial cash flows, or direct me to perform workspace actions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
                  {QUICK_PROMPTS.map((qp, idx) => {
                    const Icon = qp.icon
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(qp.prompt)}
                        className="group flex flex-col justify-between rounded-xl border border-border/60 bg-muted/30 p-3 hover:border-primary/50 hover:bg-primary/5 transition-all text-left cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-xs font-semibold text-foreground group-hover:text-primary">
                            <Icon size={14} className="text-primary" />
                            {qp.label}
                          </span>
                          <ArrowRight size={13} className="text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2">
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
                <Loader2 size={24} className="animate-spin text-primary" />
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
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-muted border border-border text-foreground'
                      }`}
                    >
                      {isUser ? <User size={15} /> : <Bot size={15} className="text-primary" />}
                    </div>

                    <div
                      className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-2xs ${
                        isUser
                          ? 'bg-primary text-primary-foreground rounded-tr-xs'
                          : 'bg-muted/40 border border-border/60 text-foreground rounded-tl-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className={`text-[10px] font-semibold ${isUser ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {isUser ? (user ? `${user.first_name} ${user.last_name}` : 'You') : 'BusinessOS Copilot'}
                        </span>
                        <span className={`text-[10px] ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {msg.timestamp}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {isUser ? (
                          <p className="text-xs md:text-sm whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          renderFormattedContent(msg.content)
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted border border-border text-foreground">
                  <Bot size={15} className="text-primary" />
                </div>
                <div className="rounded-2xl rounded-tl-xs bg-muted/40 border border-border/60 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 size={13} className="animate-spin text-primary" />
                    <span>Querying live database & synthesizing insights...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 md:p-4 border-t border-border/50 bg-card/60 backdrop-blur-sm">
            <div className="relative flex items-center rounded-xl border border-border/70 bg-muted/30 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary focus-within:bg-card transition-all">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about employees, finances, tasks, or request an action..."
                rows={1}
                className="w-full resize-none bg-transparent px-3.5 py-3 text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none max-h-32"
              />
              <div className="flex items-center gap-1.5 pr-2">
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || sendMutation.isPending}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-all cursor-pointer"
                  title="Send message (Enter)"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-muted-foreground">
              <span>Press <kbd className="font-mono font-medium">Enter</kbd> to send, <kbd className="font-mono font-medium">Shift+Enter</kbd> for new line</span>
              <span>Autonomous Tool Execution Active</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
