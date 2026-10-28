'use client'

import React, { useState, useRef } from 'react'
import {
  FileText,
  Clock,
  Trash2,
  Download,
  Eye,
  Search,
  UploadCloud,
  File,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  FileArchive,
  X,
  ExternalLink,
  Plus,
  Loader2,
  CheckCircle2,
  FolderOpen,
  Filter,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_BASE_URL } from '@/services/axios'
import { format } from 'date-fns'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
} from '@/hooks/useDocuments'
import { Document } from '@/types/document'

export default function DocumentsPage() {
  const { data: documents = [], isLoading } = useDocuments()
  const uploadMutation = useUploadDocument()
  const deleteMutation = useDeleteDocument()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all')
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (ext: string) => {
    const cleanExt = ext.toLowerCase().replace('.', '')
    if (['pdf'].includes(cleanExt)) return <FileText className="text-rose-500" size={20} />
    if (['xls', 'xlsx', 'csv'].includes(cleanExt)) return <FileSpreadsheet className="text-emerald-500" size={20} />
    if (['doc', 'docx'].includes(cleanExt)) return <FileText className="text-blue-500" size={20} />
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(cleanExt)) return <ImageIcon className="text-amber-500" size={20} />
    if (['zip', 'rar', 'tar', 'gz'].includes(cleanExt)) return <FileArchive className="text-purple-500" size={20} />
    if (['js', 'ts', 'tsx', 'py', 'json', 'html', 'css'].includes(cleanExt)) return <FileCode className="text-cyan-500" size={20} />
    return <File className="text-muted-foreground" size={20} />
  }

  const handleFileUpload = async (file: File) => {
    try {
      await uploadMutation.mutateAsync({ file })
      setIsUploadModalOpen(false)
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteMutation.mutateAsync(id)
      if (previewDoc?.id === id) setPreviewDoc(null)
    }
  }

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (!matchesSearch) return false

    if (selectedTypeFilter === 'all') return true
    const ext = doc.extension?.toLowerCase() || ''
    if (selectedTypeFilter === 'pdf') return ext === 'pdf'
    if (selectedTypeFilter === 'sheets') return ['xls', 'xlsx', 'csv'].includes(ext)
    if (selectedTypeFilter === 'docs') return ['doc', 'docx', 'txt'].includes(ext)
    if (selectedTypeFilter === 'images') return ['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)
    if (selectedTypeFilter === 'archives') return ['zip', 'rar', 'tar', 'gz'].includes(ext)
    return true
  })

  const totalBytes = documents.reduce((acc, d) => acc + (d.size || 0), 0)
  const totalDownloads = documents.reduce((acc, d) => acc + (d.downloads || 0), 0)

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Document Management</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Secure enterprise file storage, inline preview, and version history.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
            >
              <UploadCloud size={16} />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-card/60 shadow-2xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FolderOpen size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Total Documents</p>
                <p className="text-lg font-bold text-foreground">{documents.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/60 shadow-2xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Total Storage Used</p>
                <p className="text-lg font-bold text-foreground">{formatSize(totalBytes)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/60 shadow-2xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Download size={20} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">Downloads Recorded</p>
                <p className="text-lg font-bold text-foreground">{totalDownloads}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card p-3 shadow-2xs">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents or tags..."
              className="w-full rounded-xl border border-border/70 bg-muted/30 pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Files' },
              { id: 'pdf', label: 'PDFs' },
              { id: 'docs', label: 'Docs' },
              { id: 'sheets', label: 'Spreadsheets' },
              { id: 'images', label: 'Images' },
              { id: 'archives', label: 'Archives' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedTypeFilter(filter.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedTypeFilter === filter.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Table / Grid List */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
              <Loader2 size={24} className="animate-spin text-primary mb-2" />
              <p className="text-xs">Loading enterprise files...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                <FolderOpen size={24} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">No documents found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {searchQuery
                  ? 'No documents matched your search filter.'
                  : 'Upload your company spreadsheets, reports, invoices, or specifications.'}
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-4 flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Upload First File</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filteredDocs.map((doc) => {
                const ext = doc.extension?.toLowerCase() || 'file'
                const canPreview = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'txt', 'csv', 'json'].includes(ext)
                const downloadUrl = `${API_BASE_URL}/documents/${doc.id}/download`

                return (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/20 transition-all gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/40 shadow-2xs">
                        {getFileIcon(ext)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            onClick={() => setPreviewDoc(doc)}
                            className="text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer truncate"
                          >
                            {doc.name}
                          </h4>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 uppercase font-mono">
                            {ext}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            v{doc.version || '1.0'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {doc.created_at ? format(new Date(doc.created_at), 'MMM dd, yyyy') : 'Recently'}
                          </span>
                          <span>•</span>
                          <span>{formatSize(doc.size)}</span>
                          <span>•</span>
                          <span>{doc.downloads || 0} downloads</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {canPreview && (
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="Preview in browser"
                        >
                          <Eye size={13} className="text-primary" />
                          <span>Preview</span>
                        </button>
                      )}

                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                        title="Download file"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </a>

                      <button
                        onClick={() => handleDelete(doc.id, doc.name)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <h3 className="text-sm font-bold text-foreground">Upload Document</h3>
                  <button
                    onClick={() => setIsUploadModalOpen(false)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Dropzone Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0])
                    }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.zip,.txt,.json"
                  />
                  <UploadCloud size={36} className="text-primary mb-2" />
                  <p className="text-xs font-semibold text-foreground">
                    Drag and drop files here, or <span className="text-primary underline">browse</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Supports PDF, DOCX, XLSX, CSV, Images, ZIP up to 50MB
                  </p>
                </div>

                {uploadMutation.isPending && (
                  <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-xs text-primary">
                    <Loader2 size={16} className="animate-spin shrink-0" />
                    <span>Uploading and verifying storage...</span>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* In-Browser Preview Modal */}
        <AnimatePresence>
          {previewDoc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-background/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col h-[90vh] w-full max-w-4xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
              >
                {/* Modal Top Bar */}
                <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5 bg-muted/40">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {getFileIcon(previewDoc.extension)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-md">
                        {previewDoc.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        {formatSize(previewDoc.size)} • Version {previewDoc.version || '1.0'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`${API_BASE_URL}/documents/${previewDoc.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </a>
                    <button
                      onClick={() => setPreviewDoc(null)}
                      className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Modal Content Preview Area */}
                <div className="flex-1 overflow-auto bg-muted/20 p-4 flex items-center justify-center">
                  {previewDoc.extension?.toLowerCase() === 'pdf' ? (
                    <iframe
                      src={`${API_BASE_URL}/documents/${previewDoc.id}/file`}
                      className="h-full w-full rounded-xl border border-border/50 bg-white"
                      title={previewDoc.name}
                    />
                  ) : ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(previewDoc.extension?.toLowerCase() || '') ? (
                    <div className="flex items-center justify-center max-h-full">
                      <img
                        src={`${API_BASE_URL}/documents/${previewDoc.id}/file`}
                        alt={previewDoc.name}
                        className="max-h-[70vh] rounded-xl object-contain border border-border shadow-md"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-8 space-y-4 max-w-md">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border text-primary">
                        {getFileIcon(previewDoc.extension)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{previewDoc.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Direct in-browser visual rendering is not supported for <code className="font-mono">{previewDoc.extension}</code> files.
                        </p>
                      </div>
                      <a
                        href={`${API_BASE_URL}/documents/${previewDoc.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
                      >
                        <Download size={14} />
                        <span>Download to View on Desktop</span>
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
