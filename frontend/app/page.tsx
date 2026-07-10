'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function Page() {
  useEffect(() => {
    redirect('/dashboard')
  }, [])

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </main>
  )
}
