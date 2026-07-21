'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  Send, 
  MessageSquare, 
  Sparkles, 
  Brain, 
  Zap, 
  User, 
  Cpu, 
  Loader2, 
  Wand2,
  Bookmark,
  HelpCircle,
  Palette,
  Eye,
  Moon,
  Compass,
  ChevronDown
} from 'lucide-react'
import { 
  useAiChatSessions, 
  useAiChatHistory, 
  useSendAiMessage, 
  useCreateAiSession, 
  useDeleteAiSession,
  useClearChat
} from '@/hooks/useAi'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

type ColorSchemeId = 'bold' | 'minimalist' | 'cyberpunk' | 'emerald'

interface ColorScheme {
  id: ColorSchemeId
  name: string
  description: string
  userBubble: string
  aiBubble: string
  icon: React.ReactNode
}

const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 'bold',
    name: 'Classic Bold',
    description: 'Accent colors',
    userBubble: 'bg-accent text-white rounded-tr-none shadow-md shadow-accent/10',
    aiBubble: 'bg-card border border-border/40 text-foreground rounded-tl-none shadow-sm',
    icon: <Palette size={14} className="text-accent" />
  },
  {
    id: 'minimalist',
    name: 'Slate Minimal',
    description: 'Understated slate',
    userBubble: 'bg-muted/80 text-foreground border border-border/50 rounded-tr-none shadow-sm',
    aiBubble: 'bg-transparent border border-border/30 text-foreground/90 rounded-tl-none',
    icon: <Eye size={14} className="text-muted-foreground" />
  },
  {
    id: 'cyberpunk',
    name: 'Cosmic Neon',
    description: 'Vibrant gradients',
    userBubble: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white border-none rounded-tr-none shadow-lg shadow-purple-500/20',
    aiBubble: 'bg-purple-950/20 border border-purple-500/25 text-purple-200 rounded-tl-none shadow-md',
    icon: <Moon size={14} className="text-purple-400" />
  },
  {
    id: 'emerald',
    name: 'Forest Emerald',
    description: 'Soothing greens',
    userBubble: 'bg-emerald-600 text-white border-none rounded-tr-none shadow-md shadow-emerald-600/15',
    aiBubble: 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-200 rounded-tl-none shadow-sm',
    icon: <Compass size={14} className="text-emerald-400" />
  }
]

interface RolePreset {
  id: string
  name: string
  description: string
  instruction: string
  icon: React.ReactNode
}

const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'general',
    name: 'General Assistant',
    description: 'General workspace companion and task automator.',
    instruction: 'You are a helpful, context-aware general assistant for BusinessOS.',
    icon: <Wand2 size={16} className="text-pink-400" />
  },
  {
    id: 'analyst',
    name: 'Business Strategy Analyst',
    description: 'Expert on strategy, operational metrics, and planning.',
    instruction: 'You are an expert Business Analyst. Focus on analyzing business operations, finances, metrics, client relationships, and team performance, giving detailed strategic recommendations.',
    icon: <Brain size={16} className="text-blue-400" />
  },
  {
    id: 'architect',
    name: 'Software & Database Architect',
    description: 'Specialist in system design, schema structures, and code.',
    instruction: 'You are an expert Software Architect and Database Engineer. Help design highly scalable, type-safe software systems, SQLite/PostgreSQL schemas, API routes, and code logic.',
    icon: <Cpu size={16} className="text-emerald-400" />
  },
  {
    id: 'marketer',
    name: 'Marketing Specialist',
    description: 'Specialist in copy, content, and branding.',
    instruction: 'You are an expert Marketer and Copywriter. Create highly engaging, professional marketing copy, newsletters, branding guides, and business communication.',
    icon: <Sparkles size={16} className="text-amber-400" />
  },
  {
    id: 'pm',
    name: 'Agile Project Manager',
    description: 'Expert on milestones, sprints, and team velocity.',
    instruction: 'You are a seasoned Agile Project Manager. Focus on breaking tasks down into realistic milestones, writing sprint logs, assigning tasks, and resolving blockers.',
    icon: <Zap size={16} className="text-purple-400" />
  }
]

export default function AIChatbotPage() {
  const { data: sessions = [], isLoading: isLoadingSessions } = useAiChatSessions()
  const createSessionMutation = useCreateAiSession()
  const deleteSessionMutation = useDeleteAiSession()
  const sendAiMessageMutation = useSendAiMessage()
  const clearChatMutation = useClearChat()

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<RolePreset>(ROLE_PRESETS[0])
  const [customInstruction, setCustomInstruction] = useState(ROLE_PRESETS[0].instruction)
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash')
  const [inputMessage, setInputMessage] = useState('')
  const [showConfig, setShowConfig] = useState(true)
  const [selectedScheme, setSelectedScheme] = useState<ColorScheme>(COLOR_SCHEMES[0])
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollBottom, setShowScrollBottom] = useState(false)

  // Track scroll position to conditionally show "Jump to Bottom" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    // If user scrolled up more than 150px from the bottom, show the 'Jump to Bottom' button
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 150
    setShowScrollBottom(isScrolledUp)
  }

  const handleJumpToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
      setShowScrollBottom(false)
    }
  }

  // Load chat history for active session
  const { data: history = [], isLoading: isLoadingHistory } = useAiChatHistory(activeSessionId || undefined)

  // Load draft on mount or when active session changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = `chat_draft_${activeSessionId || 'general'}`
      const savedDraft = localStorage.getItem(key) || ''
      setInputMessage(savedDraft)
    }
  }, [activeSessionId])

  // Save draft on user input changes
  const handleInputChange = (val: string) => {
    setInputMessage(val)
    if (typeof window !== 'undefined') {
      const key = `chat_draft_${activeSessionId || 'general'}`
      if (val) {
        localStorage.setItem(key, val)
      } else {
        localStorage.removeItem(key)
      }
    }
  }

  // Auto-select first session if available
  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id)
    }
  }, [sessions, activeSessionId])

  // Sync custom instruction when role preset changes
  const handleRoleChange = (role: RolePreset) => {
    setSelectedRole(role)
    setCustomInstruction(role.instruction)
  }

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [history, sendAiMessageMutation.isPending])

  const handleCreateSession = () => {
    const title = `Chat session ${sessions.length + 1}`
    createSessionMutation.mutate(title, {
      onSuccess: (newSession) => {
        setActiveSessionId(newSession.id)
      }
    })
  }

  const activeSession = sessions.find(s => s.id === activeSessionId)

  const handleConfirmClear = () => {
    if (activeSessionId) {
      clearChatMutation.mutate(activeSessionId, {
        onSuccess: () => {
          setShowClearConfirm(false)
        }
      })
    }
  }

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteSessionMutation.mutate(id, {
      onSuccess: () => {
        if (activeSessionId === id) {
          const remaining = sessions.filter(s => s.id !== id)
          setActiveSessionId(remaining.length > 0 ? remaining[0].id : null)
        }
      }
    })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || sendAiMessageMutation.isPending) return

    // If no active session, create one first or use 'session-1' default
    const targetSessionId = activeSessionId || `session-${Date.now()}`
    
    if (!activeSessionId) {
      setActiveSessionId(targetSessionId)
    }

    const payload = {
      message: inputMessage.trim(),
      sessionId: targetSessionId,
      model: selectedModel,
      systemInstruction: customInstruction
    }

    sendAiMessageMutation.mutate(payload)
    setInputMessage('')
    
    // Clear auto-saved drafts
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`chat_draft_${activeSessionId || 'general'}`)
      localStorage.removeItem(`chat_draft_${targetSessionId}`)
    }
  }

  const getModelLabel = (modelId: string) => {
    switch (modelId) {
      case 'gemini-3.1-pro-preview': return 'Gemini 3.1 Pro (Complex Tasks)'
      case 'gemini-3.1-flash-lite': return 'Gemini 3.1 Flash-Lite (Fast Tasks)'
      default: return 'Gemini 3.5 Flash (General Tasks)'
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] w-full overflow-hidden">
        {/* Page Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/10 p-4 rounded-xl border border-border/40 backdrop-blur-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="text-accent animate-pulse" size={22} />
              Gemini AI Chatbot Playground
            </h1>
            <p className="text-xs text-muted-foreground">
              A multi-turn sandbox using Gemini to configure specific chatbot roles, parameters, and workspace-aware intelligence.
            </p>
          </div>
          
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 rounded-lg border border-border/40 bg-card px-3 py-1.5 text-xs font-semibold hover:border-accent hover:text-accent transition-all"
          >
            <Bookmark size={14} />
            {showConfig ? 'Hide Config' : 'Show Config'}
          </button>
        </div>

        {/* Workspace Panels */}
        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* LEFT PANEL: Conversational History Sessions */}
          <div className="w-72 shrink-0 flex flex-col rounded-xl border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/40 p-4 bg-card/50">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MessageSquare size={16} className="text-accent" />
                Conversations
              </span>
              <button
                onClick={handleCreateSession}
                disabled={createSessionMutation.isPending}
                className="rounded-lg p-1.5 border border-border/40 hover:border-accent hover:bg-primary/10 text-muted-foreground hover:text-accent transition-colors"
                title="New Chat Session"
              >
                {createSessionMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoadingSessions ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-accent" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No conversations yet. Click the + button to start one!
                </div>
              ) : (
                sessions.map((session) => {
                  const isActive = session.id === activeSessionId
                  return (
                    <div
                      key={session.id}
                      onClick={() => setActiveSessionId(session.id)}
                      className={`group relative flex items-center justify-between rounded-lg p-3 cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-primary/20 border border-accent/20 text-accent' 
                          : 'hover:bg-card border border-transparent hover:border-border/30 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-6">
                        <span className="text-xs font-semibold truncate">
                          {session.title || 'Untitled Session'}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {session.created_at ? format(new Date(session.created_at), 'MMM d, h:mm a') : 'Recent'}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        disabled={deleteSessionMutation.isPending}
                        className="opacity-0 group-hover:opacity-100 absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                        title="Delete Session"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* MAIN CHAT AREA */}
          <div className="flex-1 flex flex-col rounded-xl border border-border/40 bg-background overflow-hidden relative">
            
            {/* CHAT HEADER */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card/30 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-accent" />
                <span className="text-sm font-bold text-foreground">
                  {activeSession ? activeSession.title : 'General Conversation'}
                </span>
              </div>
              
              {/* Clear Chat Controls with Inline Confirmation */}
              {activeSessionId && (
                <div className="flex items-center gap-2">
                  <AnimatePresence mode="wait">
                    {showClearConfirm ? (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 rounded-lg p-1"
                      >
                        <span className="text-[10px] text-destructive font-semibold px-1.5">
                          Delete all messages?
                        </span>
                        <button
                          type="button"
                          onClick={handleConfirmClear}
                          disabled={clearChatMutation.isPending}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-destructive text-white hover:bg-destructive/90 transition-colors"
                        >
                          {clearChatMutation.isPending ? 'Clearing...' : 'Yes, Clear'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowClearConfirm(false)}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-card border border-border text-foreground hover:bg-card-hover transition-colors"
                        >
                          No
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="button"
                        type="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowClearConfirm(true)}
                        className="flex items-center gap-1 rounded-lg border border-border/40 hover:border-destructive/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive px-2.5 py-1.5 text-[11px] font-bold transition-all"
                      >
                        <Trash2 size={12} />
                        Clear Chat
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            
            {/* CONFIG BAR */}
            <AnimatePresence>
              {showConfig && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border-b border-border/40 bg-card/20 p-4 space-y-3 shrink-0 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Role selector dropdown */}
                    <div className="flex flex-col gap-1.5 md:col-span-6">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <User size={12} />
                        Select Chatbot Role Preset
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {ROLE_PRESETS.map((preset) => {
                          const isSelected = selectedRole.id === preset.id
                          return (
                            <button
                              key={preset.id}
                              onClick={() => handleRoleChange(preset)}
                              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                                isSelected 
                                  ? 'border-accent bg-accent/10 text-accent' 
                                  : 'border-border/40 hover:border-border/80 text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {preset.icon}
                              {preset.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Model selector options */}
                    <div className="flex flex-col gap-1.5 md:col-span-3">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Cpu size={12} />
                        Model Engine
                      </label>
                      <div className="flex flex-col gap-2">
                        {[
                          { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: 'General Tasks' },
                          { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', desc: 'Complex Tasks' },
                          { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', desc: 'Fast Tasks' }
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedModel(m.id)}
                            className={`flex items-center justify-between w-full rounded-lg border p-1.5 px-2.5 text-left transition-all ${
                              selectedModel === m.id
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border/40 hover:border-border hover:bg-card/45'
                            }`}
                          >
                            <span className="text-xs font-bold">{m.name}</span>
                            <span className="text-[9px] text-muted-foreground truncate max-w-[100px]">{m.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bubble Color Scheme */}
                    <div className="flex flex-col gap-1.5 md:col-span-3">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Palette size={12} className="text-accent" />
                        Bubble Color Scheme
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {COLOR_SCHEMES.map((scheme) => {
                          const isSelected = selectedScheme.id === scheme.id
                          return (
                            <button
                              key={scheme.id}
                              onClick={() => setSelectedScheme(scheme)}
                              className={`flex flex-col items-start gap-0.5 rounded-lg border p-1.5 text-left transition-all ${
                                isSelected
                                  ? 'border-accent bg-accent/10 text-accent'
                                  : 'border-border/40 hover:border-border hover:bg-card/45'
                              }`}
                              title={scheme.description}
                            >
                              <div className="flex items-center gap-1.5">
                                {scheme.icon}
                                <span className="text-[11px] font-bold">{scheme.name}</span>
                              </div>
                              <span className="text-[9px] text-muted-foreground truncate max-w-full">{scheme.description}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* System Instruction display box */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      <span>Active System Instruction Role Override</span>
                      <span className="text-[10px] font-normal text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                        Workspace-Context Appended
                      </span>
                    </label>
                    <textarea
                      value={customInstruction}
                      onChange={(e) => setCustomInstruction(e.target.value)}
                      placeholder="Add specific rules, voice styling, output formats..."
                      rows={2}
                      className="w-full rounded-lg border border-border/40 bg-background/50 p-2 text-xs outline-none focus:border-accent resize-none font-mono"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MESSAGE CONTAINER */}
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-card/5 relative"
            >
              {isLoadingHistory ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin text-accent" />
                    <p className="text-xs text-muted-foreground">Loading chat history...</p>
                  </div>
                </div>
              ) : history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4 animate-bounce">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">Configure Role & Start Conversation</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1.5 leading-relaxed">
                    Select a custom model above (like <strong>{selectedModel}</strong>), tweak the System Instruction role, and type a message below to test.
                  </p>
                </div>
              ) : (
                history.map((msg, idx) => {
                  const isUser = msg.role === 'user'
                  return (
                    <motion.div
                      key={msg.id || idx}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar */}
                      {!isUser && (
                        <div className="h-8 w-8 shrink-0 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                          <Sparkles size={14} />
                        </div>
                      )}

                      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                        {/* Sender info */}
                        <span className="text-[10px] font-semibold text-muted-foreground mb-1">
                          {isUser ? 'You' : `Gemini Assistant (${selectedRole.name})`}
                        </span>

                        {/* Content */}
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            isUser
                              ? `${selectedScheme.userBubble} whitespace-pre-wrap`
                              : `${selectedScheme.aiBubble} font-sans prose prose-invert max-w-none`
                          }`}
                        >
                          {isUser ? (
                            msg.content
                          ) : (
                            <ReactMarkdown
                              components={{
                                code({ node, inline, className, children, ...props }: any) {
                                  const match = /language-(\w+)/.exec(className || '')
                                  return !inline && match ? (
                                    <SyntaxHighlighter
                                      style={vscDarkPlus as any}
                                      language={match[1]}
                                      PreTag="div"
                                      className="rounded-md mt-2 mb-2 text-xs"
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code className="bg-accent/20 text-accent px-1 py-0.5 rounded text-xs" {...props}>
                                      {children}
                                    </code>
                                  )
                                }
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          )}
                        </div>

                        {/* Timestamp */}
                        {msg.timestamp && (
                          <span className="text-[9px] text-muted-foreground mt-1 px-1">
                            {msg.timestamp}
                          </span>
                        )}
                      </div>

                      {/* User Avatar */}
                      {isUser && (
                        <div className="h-8 w-8 shrink-0 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-accent">
                          <User size={14} />
                        </div>
                      )}
                    </motion.div>
                  )
                })
              )}

              {/* Loader during API mutation */}
              {sendAiMessageMutation.isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="h-8 w-8 shrink-0 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <Loader2 size={14} className="animate-spin" />
                  </div>
                  <div className="flex flex-col items-start max-w-[80%]">
                    <span className="text-[10px] font-semibold text-muted-foreground mb-1">
                      {getModelLabel(selectedModel)} is thinking...
                    </span>
                    <div className={`rounded-2xl px-4 py-3 rounded-tl-none flex items-center gap-2 ${selectedScheme.aiBubble}`}>
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce delay-100" />
                        <span className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce delay-200" />
                        <span className="h-1.5 w-1.5 bg-accent rounded-full animate-bounce delay-300" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Jump to Bottom Button */}
            <AnimatePresence>
              {showScrollBottom && (
                <motion.button
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  onClick={handleJumpToBottom}
                  className="absolute bottom-24 right-6 z-10 flex items-center gap-1.5 rounded-full bg-accent text-white px-3.5 py-2 text-xs font-bold shadow-lg hover:bg-accent-hover hover:scale-105 active:scale-95 transition-all"
                >
                  <ChevronDown size={14} className="animate-bounce" />
                  Jump to Bottom
                </motion.button>
              )}
            </AnimatePresence>

            {/* INPUT CONTROLS */}
            <div className="p-4 border-t border-border/40 bg-card/20 backdrop-blur-md">
              <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                <div className="flex-1 bg-background border border-border/40 rounded-xl overflow-hidden focus-within:border-accent transition-all shadow-inner">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                    placeholder={`Message ${selectedRole.name} using ${selectedModel === 'gemini-3.1-pro-preview' ? 'Gemini 3.1 Pro' : 'Gemini 3.5'}`}
                    rows={1}
                    className="w-full resize-none bg-transparent px-4 py-3.5 text-xs md:text-sm outline-none max-h-32 min-h-[46px]"
                  />
                  <div className="flex justify-between items-center px-4 pb-2 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Cpu size={10} className="text-accent" />
                      {selectedModel}
                      <span className="text-border">|</span>
                      <User size={10} className="text-accent" />
                      {selectedRole.id}
                    </div>
                    <div className="flex items-center gap-2">
                      {inputMessage.trim() && (
                        <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          Draft saved
                        </span>
                      )}
                      <span className="text-[9px] hover:text-accent transition-colors cursor-help flex items-center gap-0.5">
                        <HelpCircle size={10} /> Enter to Send (Shift+Enter for multi-line)
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || sendAiMessageMutation.isPending}
                  className="h-[46px] w-[46px] rounded-xl bg-accent text-white hover:bg-accent-hover active:scale-95 disabled:opacity-40 flex items-center justify-center shrink-0 transition-all shadow-md hover:shadow-lg hover:shadow-accent/10"
                >
                  {sendAiMessageMutation.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} className="ml-0.5" />
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
