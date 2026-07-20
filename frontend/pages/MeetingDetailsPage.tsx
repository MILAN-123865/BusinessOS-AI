'use client'

import { useMeeting, useCreateMeetingNote, useDeleteMeetingNote, useUpdateMeeting } from '@/hooks/useMeetings'
import { usePermission, PermissionProvider } from '@/components/providers/permission-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { AppLayout } from '@/components/layout/app-layout'
import { MeetingDetails } from '@/components/calendar/MeetingDetails'
import { MeetingParticipants } from '@/components/calendar/MeetingParticipants'
import { MeetingNotes } from '@/components/calendar/MeetingNotes'
import { ArrowLeft, Loader2, AlertCircle, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

interface MeetingDetailsPageProps {
  meetingId?: string
}

function MeetingDetailsPageContent({ meetingId }: MeetingDetailsPageProps) {
  const router = useRouter()
  const params = useParams()
  const id = meetingId || (params?.id as string)

  const { hasPermission } = usePermission()
  const canView = hasPermission('calendar.view')
  const canDeleteMeeting = hasPermission('meeting.delete')
  const canUpdateMeeting = hasPermission('meeting.update')

  const { data: meeting, isLoading, isError } = useMeeting(id)
  const createNoteMutation = useCreateMeetingNote()
  const deleteNoteMutation = useDeleteMeetingNote()
  const updateMeetingMutation = useUpdateMeeting()

  const handleCreateNote = async (content: string) => {
    if (!id) return
    await createNoteMutation.mutateAsync({ meetingId: id, content })
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!id) return
    await deleteNoteMutation.mutateAsync({ meetingId: id, noteId })
  }

  const handleStatusChange = async (status: any) => {
    if (!id) return
    await updateMeetingMutation.mutateAsync({ id, payload: { status } })
  }

  if (!canView) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <ShieldAlert size={48} className="text-destructive animate-pulse" />
          <h3 className="text-xl font-bold text-foreground">Access Restricted</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            You do not possess the necessary access token to inspect scheduled meetings.
          </p>
        </div>
      </AppLayout>
    )
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 size={36} className="text-accent animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (isError || !meeting) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <AlertCircle size={36} className="text-destructive animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">Meeting Not Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            The requested meeting could not be loaded. It may have been deleted.
          </p>
          <Link
            href="/calendar"
            className="rounded-xl bg-primary/20 px-5 py-2 text-xs font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all"
          >
            Return to Calendar
          </Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Back Button */}
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

        {/* Status controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/40 bg-card/30 p-4 backdrop-blur-md">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Module
            </span>
            <h4 className="text-sm font-bold text-foreground">Meeting Session Controller</h4>
          </div>

          {canUpdateMeeting && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Quick Status:</span>
              <select
                value={meeting.status}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                className="rounded-xl border border-border/40 bg-background/50 px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
              </select>
            </div>
          )}
        </div>

        {/* Meeting Details View Component */}
        <MeetingDetails
          meeting={meeting}
          onEdit={
            canUpdateMeeting
              ? () => router.push(`/meetings/${meeting.id}/edit`)
              : undefined
          }
        />

        {/* Grid for Participants and Notes */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <MeetingParticipants participants={meeting.participants} />
          </div>
          <div className="md:col-span-2">
            <MeetingNotes
              notes={meeting.notes}
              onCreateNote={handleCreateNote}
              onDeleteNote={handleDeleteNote}
              isSubmitting={createNoteMutation.isPending || deleteNoteMutation.isPending}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default function MeetingDetailsPage(props: MeetingDetailsPageProps) {
  return (
    <QueryProvider>
      <PermissionProvider>
        <MeetingDetailsPageContent {...props} />
      </PermissionProvider>
    </QueryProvider>
  )
}

export { MeetingDetailsPage }
