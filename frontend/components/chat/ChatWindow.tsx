'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, Smile, Hash, Users, User, Lock, MoreVertical, Image as ImageIcon, MessageSquare, Search } from 'lucide-react'
import { ChatChannel, ChatMessage, SendMessagePayload } from '@/types/chat'
import { useChatMessages, useSendChatMessage } from '@/hooks/useChat'
import { format } from 'date-fns'

interface ChatWindowProps {
  channel: ChatChannel | null
  currentUserId: string
}

const getChannelIcon = (type: string) => {
  switch (type) {
    case 'group': return <Users size={20} className="text-blue-400" />
    case 'department': return <Hash size={20} className="text-emerald-400" />
    case 'project': return <Lock size={20} className="text-amber-400" />
    default: return <User size={20} className="text-muted-foreground" />
  }
}

export function ChatWindow({ channel, currentUserId }: ChatWindowProps) {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { data: messagesData, isLoading } = useChatMessages(channel?.id || '')
  const sendMessage = useSendChatMessage()

  const messages = messagesData?.pages.flatMap(page => page.messages) || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (!channel) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background/50">
        <div className="text-center text-muted-foreground">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    )
  }

  const isDM = channel.type === 'direct'
  const displayName = isDM 
    ? channel.participants.map(p => `${p.first_name} ${p.last_name}`).join(', ') 
    : channel.name

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    sendMessage.mutate({
      channelId: channel.id,
      payload: {
        content: message.trim(),
        type: 'text'
      }
    })
    setMessage('')
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border/40 px-6 bg-card/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card border border-border/40">
            {getChannelIcon(channel.type)}
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{displayName}</h2>
            <p className="text-xs text-muted-foreground">
              {channel.participants.length} participants
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-card hover:text-foreground transition-colors">
            <Search size={20} />
          </button>
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-card hover:text-foreground transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground space-y-2">
            <p>No messages yet.</p>
            <p className="text-sm">Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUserId
            const showAvatar = !isMe && (idx === 0 || messages[idx - 1].sender_id !== msg.sender_id)

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {!isMe && (
                  <div className="w-8 shrink-0">
                    {showAvatar ? (
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-accent">
                        {msg.sender.first_name[0]}{msg.sender.last_name[0]}
                      </div>
                    ) : null}
                  </div>
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  {showAvatar && (
                    <span className="text-xs font-medium text-muted-foreground mb-1 ml-1">
                      {msg.sender.first_name} {msg.sender.last_name}
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm ${
                      isMe 
                        ? 'bg-accent text-white rounded-tr-sm' 
                        : 'bg-card border border-border/40 text-foreground rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                    {format(new Date(msg.created_at), 'h:mm a')}
                  </span>
                </div>
              </motion.div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/40 bg-card/30 backdrop-blur-md">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <div className="flex-1 rounded-xl border border-border/40 bg-background/50 focus-within:border-accent transition-colors overflow-hidden">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full resize-none bg-transparent px-4 py-3 text-sm outline-none max-h-32 min-h-[44px]"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
            />
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <button type="button" className="rounded p-1.5 hover:bg-card hover:text-foreground transition-colors">
                  <Paperclip size={18} />
                </button>
                <button type="button" className="rounded p-1.5 hover:bg-card hover:text-foreground transition-colors">
                  <ImageIcon size={18} />
                </button>
                <button type="button" className="rounded p-1.5 hover:bg-card hover:text-foreground transition-colors">
                  <Smile size={18} />
                </button>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={!message.trim() || sendMessage.isPending}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-accent text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {sendMessage.isPending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send size={18} className="ml-1" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
