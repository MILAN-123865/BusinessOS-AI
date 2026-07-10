'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { FileText, Folder, Share2, MoreHorizontal, Clock, Eye } from 'lucide-react'

const documents = [
  { id: 1, name: 'Q3 Strategy Document', type: 'Document', size: '2.4 MB', modified: '2 hours ago', shared: true },
  { id: 2, name: 'Product Roadmap', type: 'Spreadsheet', size: '1.1 MB', modified: '1 day ago', shared: true },
  { id: 3, name: 'Design Guidelines', type: 'Document', size: '5.2 MB', modified: '3 days ago', shared: false },
  { id: 4, name: 'Budget Planning 2024', type: 'Spreadsheet', size: '0.8 MB', modified: '5 days ago', shared: true },
  { id: 5, name: 'Team Handbook', type: 'Document', size: '3.1 MB', modified: '1 week ago', shared: true },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function DocumentsPage() {
  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Documents</h1>
            <p className="mt-2 text-muted-foreground">Organize and share your documents</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg bg-primary/20 px-4 py-2.5 font-medium text-accent hover:bg-primary/30"
          >
            Upload Document
          </motion.button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          variants={containerVariants}
          className="grid gap-4 sm:grid-cols-3"
        >
          {[
            { label: 'Total Documents', value: String(documents.length) },
            { label: 'Shared', value: String(documents.filter(d => d.shared).length) },
            { label: 'Total Size', value: '15.6 MB' },
          ].map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Documents Table */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Your Documents</CardTitle>
              <CardDescription>Recently accessed and updated files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc, idx) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between rounded-lg border border-border/40 bg-card/40 p-4 hover:bg-card/60 transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                        <FileText size={20} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{doc.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock size={12} />
                          {doc.modified}
                          {' • '}
                          {doc.size}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{doc.type}</Badge>
                      {doc.shared && (
                        <motion.button whileHover={{ scale: 1.05 }} className="text-accent">
                          <Share2 size={18} />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal size={18} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}
