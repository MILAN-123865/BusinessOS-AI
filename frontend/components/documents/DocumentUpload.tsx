'use client'

import { useState } from 'react'
import { FileUploader } from './FileUploader'
import { CreateDocumentPayload, DocumentVisibility } from '@/types/document'
import { Project } from '@/types/project'
import { Tag, Globe, ClipboardList, Info, HelpCircle } from 'lucide-react'

interface DocumentUploadProps {
  projects?: Project[]
  onUpload: (file: File, payload: CreateDocumentPayload) => Promise<void>
  isUploading?: boolean
}

export function DocumentUpload({
  projects = [],
  onUpload,
  isUploading = false,
}: DocumentUploadProps) {
  const [desc, setDesc] = useState('')
  const [vis, setVis] = useState<DocumentVisibility>('organization')
  const [projId, setProjId] = useState('')
  const [tagInput, setTagInput] = useState('')

  const handleUploadFile = async (file: File) => {
    // Process tags
    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    const payload: CreateDocumentPayload = {
      name: file.name,
      description: desc || undefined,
      visibility: vis,
      project_id: projId || undefined,
      tags,
    }

    await onUpload(file, payload)

    // Reset inputs
    setDesc('')
    setVis('organization')
    setProjId('')
    setTagInput('')
  }

  return (
    <div className="space-y-5 rounded-2xl border border-border/40 bg-card/30 p-5 backdrop-blur-md">
      <div className="flex items-center gap-2 border-b border-border/20 pb-3">
        <div className="rounded-lg bg-primary/20 p-2 text-accent">
          <Info size={16} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Upload Workstation</h3>
          <p className="text-[10px] text-muted-foreground">Specify parameters before sending assets.</p>
        </div>
      </div>

      {/* Meta forms */}
      <div className="space-y-4">
        {/* Description */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase">File Description</label>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Context, version notes, summaries..."
            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Tag size={10} />
            Metadata Tags (Comma Separated)
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="invoice, marketing, 2026"
            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Visibility */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Globe size={10} />
              Visibility Status
            </label>
            <select
              value={vis}
              onChange={(e) => setVis(e.target.value as DocumentVisibility)}
              className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
            >
              <option value="organization">Organization-wide</option>
              <option value="private">Private (Only me)</option>
              <option value="department">Department members</option>
            </select>
          </div>

          {/* Project */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <ClipboardList size={10} />
              Associated Project
            </label>
            <select
              value={projId}
              onChange={(e) => setProjId(e.target.value)}
              className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
            >
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* File Dropzone / Progress */}
      <div className="pt-2 border-t border-border/20">
        <FileUploader onUpload={handleUploadFile} isUploading={isUploading} />
      </div>
    </div>
  )
}
