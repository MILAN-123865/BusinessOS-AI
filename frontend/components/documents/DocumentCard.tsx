'use client'

import { Document } from '@/types/document'
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileUp,
  FileCode,
  File,
  Eye,
  Download,
  Share2,
  Trash2,
  MoreVertical,
  FolderOpen,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { getDocumentDownloadUrlApi } from '@/api/document'

interface DocumentCardProps {
  document: Document
  onSelect: (doc: Document) => void
  onShare?: (doc: Document) => void
  onDelete?: (doc: Document) => void
  canDelete?: boolean
  canShare?: boolean
}

export const getFileIcon = (ext: string) => {
  const cleanExt = ext.toLowerCase().replace('.', '')
  switch (cleanExt) {
    case 'pdf':
      return <File className="text-red-400" size={24} />
    case 'docx':
    case 'doc':
      return <FileText className="text-blue-400" size={24} />
    case 'xlsx':
    case 'xls':
    case 'csv':
      return <FileSpreadsheet className="text-emerald-400" size={24} />
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
      return <FileImage className="text-cyan-400" size={24} />
    case 'zip':
    case 'rar':
      return <FileUp className="text-purple-400" size={24} />
    case 'txt':
    case 'md':
      return <FileText className="text-slate-400" size={24} />
    default:
      return <File className="text-slate-400" size={24} />
  }
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function DocumentCard({
  document,
  onSelect,
  onShare,
  onDelete,
  canDelete = false,
  canShare = false,
}: DocumentCardProps) {
  const downloadUrl = getDocumentDownloadUrlApi(document.id)

  return (
    <motion.div
      whileHover={{ scale: 1.015, y: -2 }}
      transition={{ duration: 0.15 }}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/40 bg-card/30 p-4 backdrop-blur-md hover:bg-card/50 hover:shadow-lg hover:border-accent/30"
    >
      <div className="space-y-3 cursor-pointer" onClick={() => onSelect(document)}>
        {/* Top Details */}
        <div className="flex items-start justify-between gap-3">
          <div className="rounded-xl bg-background/50 p-2.5 border border-border/20">
            {getFileIcon(document.extension)}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={downloadUrl}
              download
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg p-1.5 hover:bg-card text-muted-foreground hover:text-foreground transition-all"
              title="Download File"
            >
              <Download size={14} />
            </a>
            {canShare && onShare && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onShare(document)
                }}
                className="rounded-lg p-1.5 hover:bg-card text-muted-foreground hover:text-foreground transition-all"
                title="Share Document"
              >
                <Share2 size={14} />
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(document)
                }}
                className="rounded-lg p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                title="Delete Document"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground truncate" title={document.name}>
            {document.name}
          </h4>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold font-mono">
            {document.extension.toUpperCase().replace('.', '')} • {formatBytes(document.size)}
          </p>
        </div>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {document.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-accent border border-accent/10"
              >
                {tag}
              </span>
            ))}
            {document.tags.length > 3 && (
              <span className="text-[9px] text-muted-foreground font-semibold">
                +{document.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Owner: {document.owner ? `${document.owner.first_name} ${document.owner.last_name[0]}.` : 'Guest'}</span>
        <span>{new Date(document.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
      </div>
    </motion.div>
  )
}
