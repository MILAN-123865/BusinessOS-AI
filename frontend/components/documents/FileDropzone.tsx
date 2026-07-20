'use client'

import { useState, useRef } from 'react'
import { UploadCloud, File, AlertCircle, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  allowedExtensions?: string[]
  maxSizeMB?: number
}

export function FileDropzone({
  onFileSelect,
  allowedExtensions = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'csv', 'pptx', 'txt', 'png', 'jpeg', 'jpg', 'svg', 'zip'],
  maxSizeMB = 50,
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    setErrorMsg(null)
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!allowedExtensions.includes(ext)) {
      setErrorMsg(`Extension .${ext} is not allowed. Supported formats: ${allowedExtensions.join(', ').toUpperCase()}`)
      return false
    }
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      setErrorMsg(`File size exceeds the ${maxSizeMB}MB limit.`)
      return false
    }
    return true
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        onFileSelect(file)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        onFileSelect(file)
      }
    }
  }

  const onButtonClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <motion.div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-accent bg-accent/10 scale-[1.01]'
            : 'border-border/40 bg-card/10 hover:border-accent/40 hover:bg-card/20'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleInputChange}
          accept={allowedExtensions.map((e) => `.${e}`).join(',')}
        />

        <UploadCloud size={32} className={`text-muted-foreground mb-3 ${isDragActive ? 'text-accent animate-bounce' : ''}`} />
        <p className="text-xs font-semibold text-foreground">
          Drag and drop files here, or <span className="text-accent underline">browse files</span>
        </p>
        <p className="text-[10px] text-muted-foreground mt-1.5 uppercase font-semibold">
          PDF, Word, Excel, Images, Zip (Max {maxSizeMB}MB)
        </p>
      </motion.div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/15 p-3 text-destructive">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span className="text-[10px] font-semibold leading-normal">{errorMsg}</span>
        </div>
      )}
    </div>
  )
}
