'use client'

import { useState } from 'react'
import { FileDropzone } from './FileDropzone'
import { formatBytes } from './DocumentCard'
import { File, Loader2, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>
  isUploading?: boolean
}

export function FileUploader({ onUpload, isUploading = false }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const handleClear = () => {
    setSelectedFile(null)
  }

  const handleUploadSubmit = async () => {
    if (!selectedFile) return
    await onUpload(selectedFile)
    setSelectedFile(null)
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <FileDropzone onFileSelect={handleFileSelect} />
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-border/40 bg-card/20 p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-xl bg-primary/20 p-2.5 text-accent">
                <File size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold font-mono mt-0.5">
                  {formatBytes(selectedFile.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleClear}
                disabled={isUploading}
                className="rounded-lg p-1.5 hover:bg-card text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                title="Remove File"
              >
                <X size={14} />
              </button>

              <button
                onClick={handleUploadSubmit}
                disabled={isUploading}
                className="flex items-center gap-1 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-foreground hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                <span>Upload</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
