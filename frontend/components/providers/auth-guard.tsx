'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

const PUBLIC_PATHS = ['/', '/landing', '/login', '/register', '/signup', '/forgot-password']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const isPublicPath = pathname ? PUBLIC_PATHS.includes(pathname) : false

    if (!isAuthenticated || !accessToken) {
      if (!isPublicPath) {
        router.replace('/login')
      }
    } else {
      if (pathname === '/login' || pathname === '/register') {
        router.replace('/dashboard')
      }
    }
  }, [isAuthenticated, accessToken, pathname, router])

  return <>{children}</>
}
