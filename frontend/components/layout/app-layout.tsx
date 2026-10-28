'use client'

import { Sidebar } from './sidebar'
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader'
import { CommandPalette } from '@/components/command/CommandPalette'
import { AIAssistant } from '@/components/ui/ai-assistant'
import { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors antialiased selection:bg-primary/20 selection:text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <WorkspaceHeader />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      <CommandPalette />
      <AIAssistant />
    </div>
  )
}

