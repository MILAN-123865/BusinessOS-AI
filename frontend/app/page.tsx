'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated, accessToken } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [isAuthenticated, accessToken, router])

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#070D18]">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="text-sm text-muted-foreground">Loading BusinessOS Workstation...</p>
      </div>
    </main>
  )
}
