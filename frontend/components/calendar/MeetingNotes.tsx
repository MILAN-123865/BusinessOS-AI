'use client'

import { useState } from 'react'
import { MeetingNote } from '@/types/meeting'
import { Plus, Trash2, Edit3, Loader2, FileText, User } from 'lucide-react'
import { formatDateTime } from '@/lib/calendar-utils'

interface MeetingNotesProps {
  notes: MeetingNote[]
  onCreateNote: (content: string) => Promise<void>
  onDeleteNote: (id: string) => Promise<void>
  isSubmitting?: boolean
}

export function MeetingNotes({
  notes = [],
  onCreateNote,
  onDeleteNote,
  isSubmitting = false,
}: MeetingNotesProps) {
  const [noteContent, setNoteContent] = useState('')

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim()) return
    await onCreateNote(noteContent)
    setNoteContent('')
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-card/30 p-5 backdrop-blur-md space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/20 pb-2">
        <FileText size={14} className="text-accent" />
        Meeting Minutes & Notes ({notes.length})
      </h3>

      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="flex gap-2">
        <input
          type="text"
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Capture a key decision or action item..."
          className="flex-1 rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={isSubmitting || !noteContent.trim()}
          className="flex shrink-0 items-center justify-center gap-1 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-foreground hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          <span>Add Note</span>
        </button>
      </form>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-xs text-muted-foreground">No notes captured yet. Add minutes above.</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-border/20 bg-card/45 p-3.5"
            >
              <div className="space-y-1.5 min-w-0">
                <p className="text-xs text-foreground leading-relaxed break-words">
                  {note.content}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium">
                    <User size={10} />
                    {note.author ? `${note.author.first_name} ${note.author.last_name}` : 'Team Member'}
                  </span>
                  <span>•</span>
                  <span>{note.created_at ? formatDateTime(note.created_at) : 'Just now'}</span>
                </div>
              </div>

              <button
                onClick={() => onDeleteNote(note.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1"
                title="Remove Note"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
