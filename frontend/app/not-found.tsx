'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* 404 Graphic */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-8 text-8xl font-bold text-primary/30"
        >
          404
        </motion.div>

        <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>

        <div className="mt-8 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-primary/20 px-6 py-3 font-medium text-accent hover:bg-primary/30 transition-colors"
            >
              <Home size={20} />
              Go to Dashboard
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>

        <div className="mt-12 text-sm text-muted-foreground/60">
          Error Code: 404 - Not Found
        </div>
      </motion.div>
    </div>
  )
}
