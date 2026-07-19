'use client'

import { Document } from '@/types/document'
import { DocumentCard } from './DocumentCard'
import { FileQuestion } from 'lucide-react'
import { motion } from 'framer-motion'

interface DocumentGridProps {
  documents: Document[]
  onSelect: (doc: Document) => void
  onShare?: (doc: Document) => void
  onDelete?: (doc: Document) => void
  canDelete?: boolean
  canShare?: boolean
}

export function DocumentGrid({
  documents = [],
  onSelect,
  onShare,
  onDelete,
  canDelete = false,
  canShare = false,
}: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border border-dashed border-border/40 rounded-2xl bg-card/5">
        <FileQuestion size={36} className="opacity-40 mb-2 animate-pulse" />
        <p className="text-sm font-semibold">No documents found matching the filters.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onSelect={onSelect}
          onShare={onShare}
          onDelete={onDelete}
          canDelete={canDelete}
          canShare={canShare}
        />
      ))}
    </div>
  )
}
