'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Hash, Users, User, Lock, MoreVertical } from 'lucide-react'
import { ChatChannel } from '@/types/chat'
import { formatDistanceToNow } from 'date-fns'

interface ChatSidebarProps {
  channels: ChatChannel[]
  activeChannelId: string | null
  onSelectChannel: (id: string) => void
}

const getChannelIcon = (type: string) => {
  switch (type) {
    case 'group': return <Users size={16} className="text-blue-400" />
    case 'department': return <Hash size={16} className="text-emerald-400" />
    case 'project': return <Lock size={16} className="text-amber-400" />
    default: return <User size={16} className="text-muted-foreground" />
  }
}

export function ChatSidebar({ channels, activeChannelId, onSelectChannel }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChannels = channels.filter(c => {
    if (!c.name) {
      // DM channel, match participant name
      return c.participants.some(p => 
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return c.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="flex w-80 flex-col border-r border-border/40 bg-card/30 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between border-b border-border/40 px-4">
        <h2 className="text-lg font-semibold">Messages</h2>
        <button className="rounded-lg p-2 text-muted-foreground hover:bg-primary/20 hover:text-accent transition-colors">
          <Plus size={20} />
        </button>
      </div>

      <div className="p-4 border-b border-border/40">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border/40 bg-background/50 py-2 pl-9 pr-4 text-sm outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredChannels.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No conversations found.
          </div>
        ) : (
          <div className="space-y-1">
            {filteredChannels.map((channel) => {
              const isActive = channel.id === activeChannelId
              const isDM = channel.type === 'direct'
              const displayName = isDM 
                ? channel.participants.map(p => `${p.first_name} ${p.last_name}`).join(', ') 
                : channel.name

              return (
                <button
                  key={channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                  className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-all ${
                    isActive ? 'bg-primary/20 text-foreground' : 'hover:bg-card/60'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card border border-border/40">
                    {getChannelIcon(channel.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`truncate text-sm font-medium ${isActive ? 'text-accent' : ''}`}>
                        {displayName}
                      </p>
                      {channel.last_message && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(channel.last_message.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="truncate text-xs text-muted-foreground">
                        {channel.last_message?.content || 'No messages yet'}
                      </p>
                      {channel.unread_count > 0 && (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                          {channel.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
