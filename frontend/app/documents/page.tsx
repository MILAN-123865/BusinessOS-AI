'use client'

import { useRef } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { FileText, Clock, Trash2, Loader2, Upload } from 'lucide-react'
import { useDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/useDocuments'
import { format } from 'date-fns'

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
  const { data: documents = [], isLoading } = useDocuments()
  const uploadMutation = useUploadDocument()
  const deleteMutation = useDeleteDocument()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadMutation.mutate({ file })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(id)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const totalSize = documents.reduce((acc, doc) => acc + (doc.size || 0), 0)

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
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUploadClick}
              disabled={uploadMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2.5 font-medium text-accent hover:bg-primary/30 disabled:opacity-50"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Document
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          variants={containerVariants}
          className="grid gap-4 sm:grid-cols-3"
        >
          {[
            { label: 'Total Documents', value: String(documents.length) },
            { label: 'Total Downloads (Sum)', value: String(documents.reduce((acc, d) => acc + (d.downloads || 0), 0)) },
            { label: 'Total Storage Size', value: formatSize(totalSize) },
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
              {isLoading ? (
                <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
                  <Loader2 size={24} className="animate-spin text-accent mb-2" />
                  <p>Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center text-center text-muted-foreground border border-dashed border-border/40 rounded-lg p-6">
                  <p className="font-medium text-foreground">No documents found</p>
                  <p className="text-sm mt-1">Upload a document to get started.</p>
                </div>
              ) : (
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
                          <a
                            href={doc.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline text-foreground hover:text-accent"
                          >
                            {doc.name}
                          </a>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Clock size={12} />
                            {format(new Date(doc.created_at), 'MMM dd, yyyy')}
                            {' • '}
                            {formatSize(doc.size)}
                            {' • '}
                            Downloads: {doc.downloads}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{doc.extension.toUpperCase() || 'FILE'}</Badge>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(doc.id)}
                          disabled={deleteMutation.isPending}
                          className="rounded-lg p-1.5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}
