'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FolderPlus, Edit3, Loader2 } from 'lucide-react'

interface FolderDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
  initialName?: string
  isSubmitting?: boolean
}

export function FolderDialog({
  isOpen,
  onClose,
  onSubmit,
  initialName = '',
  isSubmitting = false,
}: FolderDialogProps) {
  const [folderName, setFolderName] = useState(initialName)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) return
    await onSubmit(folderName)
    setFolderName('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm rounded-2xl border border-border/40 bg-card/95 p-6 backdrop-blur-xl shadow-2xl space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/20 pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/20 p-2 text-accent">
                    {initialName ? <Edit3 size={16} /> : <FolderPlus size={16} />}
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    {initialName ? 'Rename Folder' : 'New Folder Workspace'}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Folder Name</label>
                  <input
                    type="text"
                    required
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Q3 Analytics, Design Assets..."
                    className="w-full rounded-xl border border-border/40 bg-background/50 px-3.5 py-2 text-xs text-foreground outline-none focus:border-accent"
                  />
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-border/40 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !folderName.trim()}
                    className="flex justify-center items-center gap-1.5 rounded-xl bg-accent px-5 py-2 text-xs font-bold text-accent-foreground hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                    <span>{initialName ? 'Save' : 'Create'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
