'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCurrentUser } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/app-layout'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken, updateUser } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()
  
  const [isMounted, setIsMounted] = useState(false)
  const [storeHydrated, setStoreHydrated] = useState(false)
  const [isBypassed, setIsBypassed] = useState(false)

  // Fetch fresh user details to sync roles/permissions in real-time
  const { data: freshUser } = useCurrentUser()

  // Track client-side mount and Zustand store hydration
  useEffect(() => {
    setIsMounted(true)

    const checkHydration = () => {
      if (useAuthStore.persist.hasHydrated()) {
        setStoreHydrated(true)
      } else {
        const timer = setTimeout(checkHydration, 50)
        return () => clearTimeout(timer)
      }
    }
    checkHydration()
  }, [])

  // Sync fresh user data into local storage / Zustand store
  useEffect(() => {
    if (freshUser) {
      updateUser(freshUser)
    }
  }, [freshUser, updateUser])

  // Limit loading states to max 3.0 seconds - bypass if stuck for any reason
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!storeHydrated || !isMounted) {
        console.warn('Authentication or hydration timed out. Bypassing guard.')
        setStoreHydrated(true)
        setIsMounted(true)
        setIsBypassed(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [isMounted, storeHydrated])

  const isPublicPath = pathname ? PUBLIC_PATHS.includes(pathname) : false
  const isLoggedIn = isAuthenticated && accessToken
  
  // Only decide redirects once the Zustand store is hydrated from localStorage
  const shouldRedirectToLogin = storeHydrated && !isLoggedIn && !isPublicPath && !isBypassed
  const shouldRedirectToDashboard = storeHydrated && isLoggedIn && pathname === '/login'

  // Handle client-side routing transparently with SPA transitions
  useEffect(() => {
    if (!isMounted || !storeHydrated) return

    if (shouldRedirectToLogin) {
      router.replace('/login')
    } else if (shouldRedirectToDashboard) {
      router.replace('/dashboard')
    }
  }, [isMounted, storeHydrated, shouldRedirectToLogin, shouldRedirectToDashboard, router])

  // Public paths (like /login or /) render immediately without any blocker
  if (isPublicPath) {
    return <>{children}</>
  }

  // Show a clean, temporary loader if not mounted, not hydrated, or during redirect transition
  if (((!isMounted || !storeHydrated) || shouldRedirectToLogin || shouldRedirectToDashboard) && !isBypassed) {
    return (
      <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-[#0B1220]">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto" />
          <p className="text-sm font-medium text-slate-400">Loading BusinessOS...</p>
        </div>
      </div>
    )
  }

  // Safe to render protected page contents inside the global AppLayout to prevent remounting
  return (
    <AppLayout>
      {children}
    </AppLayout>
  )
}


