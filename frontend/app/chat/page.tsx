'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { useChatChannels } from '@/hooks/useChat'
import { useAuth } from '@/hooks/useAuth'

export default function ChatPage() {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const { data: channels = [], isLoading } = useChatChannels()
  
  // Use a fallback user ID if useAuth doesn't return one directly here
  // Assuming useAuth provides the current user
  const { user } = useAuth()
  const currentUserId = user?.id || 'current-user-id'

  const activeChannel = channels.find(c => c.id === activeChannelId) || null

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-8rem)] w-full overflow-hidden rounded-xl border border-border/40 shadow-sm">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center bg-card/30 backdrop-blur-md">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        ) : (
          <>
            <ChatSidebar
              channels={channels}
              activeChannelId={activeChannelId}
              onSelectChannel={setActiveChannelId}
            />
            <ChatWindow 
              channel={activeChannel} 
              currentUserId={currentUserId} 
            />
          </>
        )}
      </div>
    </AppLayout>
  )
}
