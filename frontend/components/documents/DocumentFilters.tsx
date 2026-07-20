'use client'

import { Project } from '@/types/project'
import { Filter, X, Check } from 'lucide-react'

interface DocumentFiltersProps {
  selectedMimeType: string
  onMimeTypeChange: (mime: string) => void
  selectedProject: string
  onProjectChange: (projId: string) => void
  selectedSizeLimit: string
  onSizeLimitChange: (limit: string) => void
  projects: Project[]
  onReset: () => void
}

const FILE_TYPE_OPTIONS = [
  { label: 'All Formats', value: '' },
  { label: 'PDF Documents', value: 'application/pdf' },
  { label: 'Word (DOCX/DOC)', value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { label: 'Spreadsheets (Excel/CSV)', value: 'spreadsheet' },
  { label: 'Images (PNG/JPG/SVG)', value: 'image' },
  { label: 'Archives (ZIP)', value: 'application/zip' },
]

const SIZE_OPTIONS = [
  { label: 'Any Size', value: '' },
  { label: 'Under 1 MB', value: '1MB' },
  { label: '1 MB to 10 MB', value: '10MB' },
  { label: 'Over 10 MB', value: 'large' },
]

export function DocumentFilters({
  selectedMimeType,
  onMimeTypeChange,
  selectedProject,
  onProjectChange,
  selectedSizeLimit,
  onSizeLimitChange,
  projects = [],
  onReset,
}: DocumentFiltersProps) {
  const isFiltered = selectedMimeType || selectedProject || selectedSizeLimit

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border/40 bg-card/30 p-4.5 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-border/20 pb-2.5">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Filter size={14} className="text-accent" />
          Filter station
        </span>
        {isFiltered && (
          <button
            onClick={onReset}
            className="text-[10px] font-bold text-destructive hover:underline flex items-center gap-0.5"
          >
            <X size={10} />
            Reset
          </button>
        )}
      </div>

      {/* File Type */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          File Format
        </label>
        <select
          value={selectedMimeType}
          onChange={(e) => onMimeTypeChange(e.target.value)}
          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
        >
          {FILE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Project */}
      {projects.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Project Association
          </label>
          <select
            value={selectedProject}
            onChange={(e) => onProjectChange(e.target.value)}
            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* File Size */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          File Size
        </label>
        <select
          value={selectedSizeLimit}
          onChange={(e) => onSizeLimitChange(e.target.value)}
          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
        >
          {SIZE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
