'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar } from 'lucide-react'
import { MeetingForm, CreateMeetingFormPayload } from './MeetingForm'
import { Project } from '@/types/project'
import { User } from '@/types/auth'

interface CreateMeetingDialogProps {
  isOpen: boolean
  onClose: () => void
  projects?: Project[]
  employees?: User[]
  onSubmit: (values: CreateMeetingFormPayload) => Promise<void>
  isSubmitting?: boolean
}

export function CreateMeetingDialog({
  isOpen,
  onClose,
  projects = [],
  employees = [],
  onSubmit,
  isSubmitting = false,
}: CreateMeetingDialogProps) {
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
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/40 bg-card/95 p-6 backdrop-blur-xl shadow-2xl space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/20 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-primary/20 p-2 text-accent">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Schedule New Meeting</h3>
                    <p className="text-xs text-muted-foreground">Setup parameters and invite collaborators.</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <MeetingForm
                projects={projects}
                employees={employees}
                onSubmit={onSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
