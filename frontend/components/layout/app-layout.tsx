'use client'

import { Sidebar } from './sidebar'
import { Navbar } from './navbar'
import { CommandPalette } from '@/components/ui/command-palette'
import { AIAssistant } from '@/components/ui/ai-assistant'
import { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="mt-16 flex-1 p-6 lg:ml-0">
          {children}
        </main>
      </div>
      <CommandPalette />
      <AIAssistant />
    </div>
  )
}
