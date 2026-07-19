'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Loader2 } from 'lucide-react'

interface DeleteMeetingDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  meetingTitle: string
  isDeleting?: boolean
}

export function DeleteMeetingDialog({
  isOpen,
  onClose,
  onConfirm,
  meetingTitle,
  isDeleting = false,
}: DeleteMeetingDialogProps) {
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

          {/* Modal box */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-2xl border border-destructive/20 bg-card/95 p-6 backdrop-blur-xl shadow-2xl space-y-5"
            >
              {/* Header */}
              <div className="flex items-start gap-3.5">
                <div className="rounded-xl bg-destructive/15 p-2.5 text-destructive border border-destructive/20">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Cancel scheduled meeting?</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Are you sure you want to cancel and delete the meeting &quot;{meetingTitle}&quot;?
                    This will remove the event from all participant schedules and cannot be undone.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-border/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-border/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                  Keep Meeting
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex justify-center items-center gap-1.5 rounded-xl bg-destructive px-5 py-2.5 text-xs font-bold text-destructive-foreground hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isDeleting && <Loader2 size={13} className="animate-spin" />}
                  <span>Cancel Meeting</span>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
