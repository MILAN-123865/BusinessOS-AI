'use client'

import { Document } from '@/types/document'
import { getFileIcon, formatBytes } from './DocumentCard'
import { Download, Share2, Trash2, Eye, ExternalLink } from 'lucide-react'
import { getDocumentDownloadUrlApi } from '@/api/document'

interface DocumentTableProps {
  documents: Document[]
  onSelect: (doc: Document) => void
  onShare?: (doc: Document) => void
  onDelete?: (doc: Document) => void
  canDelete?: boolean
  canShare?: boolean
}

export function DocumentTable({
  documents = [],
  onSelect,
  onShare,
  onDelete,
  canDelete = false,
  canShare = false,
}: DocumentTableProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border border-dashed border-border/40 rounded-2xl bg-card/5">
        <p className="text-sm font-semibold">No documents found matching the filters.</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border/40 bg-card/20 backdrop-blur-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border/30 text-xs font-bold uppercase tracking-wider text-muted-foreground bg-card/45">
            <th className="p-4 pl-6">Name</th>
            <th className="p-4">Extension</th>
            <th className="p-4">Size</th>
            <th className="p-4">Uploaded By</th>
            <th className="p-4">Created At</th>
            <th className="p-4 pr-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {documents.map((doc) => {
            const downloadUrl = getDocumentDownloadUrlApi(doc.id)
            return (
              <tr
                key={doc.id}
                onClick={() => onSelect(doc)}
                className="text-xs text-foreground/80 hover:bg-card/40 transition-colors cursor-pointer group"
              >
                {/* Name */}
                <td className="p-4 pl-6 font-semibold flex items-center gap-3">
                  <div className="rounded-lg bg-background/50 p-1.5 border border-border/20 shrink-0">
                    {getFileIcon(doc.extension)}
                  </div>
                  <span className="truncate max-w-[240px] text-foreground group-hover:text-accent transition-colors" title={doc.name}>
                    {doc.name}
                  </span>
                </td>

                {/* Extension */}
                <td className="p-4 uppercase font-mono">{doc.extension.replace('.', '')}</td>

                {/* Size */}
                <td className="p-4 font-mono">{formatBytes(doc.size)}</td>

                {/* Uploaded By */}
                <td className="p-4">
                  {doc.uploader ? `${doc.uploader.first_name} ${doc.uploader.last_name}` : 'Collaborator'}
                </td>

                {/* Created At */}
                <td className="p-4">
                  {new Date(doc.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>

                {/* Actions */}
                <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <a
                      href={downloadUrl}
                      download
                      className="rounded-lg p-1.5 hover:bg-card text-muted-foreground hover:text-foreground transition-all"
                      title="Download File"
                    >
                      <Download size={14} />
                    </a>
                    {canShare && onShare && (
                      <button
                        onClick={() => onShare(doc)}
                        className="rounded-lg p-1.5 hover:bg-card text-muted-foreground hover:text-foreground transition-all"
                        title="Share Document"
                      >
                        <Share2 size={14} />
                      </button>
                    )}
                    {canDelete && onDelete && (
                      <button
                        onClick={() => onDelete(doc)}
                        className="rounded-lg p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                        title="Delete Document"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
