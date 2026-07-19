'use client'

import { FileUp, HardDrive, Share2, Star } from 'lucide-react'

interface DocumentHeaderProps {
  totalFiles: number
  storageUsedBytes: number
  sharedCount: number
}

function formatBytesShort(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function DocumentHeader({
  totalFiles = 0,
  storageUsedBytes = 0,
  sharedCount = 0,
}: DocumentHeaderProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/20 pb-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          Document Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-xl">
          Upload, manage versions, and share team documents within a structured folder workstation.
        </p>
      </div>

      {/* Telemetry Stats widgets */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Total Storage */}
        <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 p-3">
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
            <HardDrive size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Storage Used
            </p>
            <p className="text-sm font-bold text-foreground">
              {formatBytesShort(storageUsedBytes)}
            </p>
          </div>
        </div>

        {/* Total Files */}
        <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 p-3">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
            <FileUp size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Assets
            </p>
            <p className="text-sm font-bold text-foreground">{totalFiles} Files</p>
          </div>
        </div>

        {/* Shared Files */}
        <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 p-3">
          <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
            <Share2 size={16} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Shared Externally
            </p>
            <p className="text-sm font-bold text-foreground">{sharedCount} Files</p>
          </div>
        </div>
      </div>
    </div>
  )
}
