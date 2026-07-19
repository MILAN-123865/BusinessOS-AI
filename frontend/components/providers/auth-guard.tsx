'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'


const PUBLIC_PATHS = ['/login', '/landing', '/']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken, user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Check if store has finished rehydrating from localStorage
    const hasRehydrated = useAuthStore.persist.hasHydrated()
    if (!hasRehydrated) return

    const isPublicPath = PUBLIC_PATHS.includes(pathname)

    if (!isAuthenticated || !accessToken) {
      if (!isPublicPath) {
        router.replace('/login')
      } else {
        setIsReady(true)
      }
    } else {
      if (pathname === '/login') {
        router.replace('/dashboard')
      } else {
        setIsReady(true)
      }
    }
  }, [isAuthenticated, accessToken, pathname, router])

  // Monitor store hydration
  useEffect(() => {
    const unsub = useAuthStore.persist.onHydrate(() => {
      setIsReady(false)
    })
    const unsubFinish = useAuthStore.persist.onFinishHydration(() => {
      setIsReady(true)
    })
    
    if (useAuthStore.persist.hasHydrated()) {
      setIsReady(true)
    }

    return () => {
      unsub()
      unsubFinish()
    }
  }, [])

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1220] text-accent">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto" />
          <p className="text-sm font-medium">Validating security context...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
