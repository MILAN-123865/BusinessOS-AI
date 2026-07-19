'use client'

import { useMeeting, useUpdateMeeting } from '@/hooks/useMeetings'
import { useEmployees } from '@/hooks/useEmployees'
import { useProjects } from '@/hooks/useProjects'
import { usePermission, PermissionProvider } from '@/components/providers/permission-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { AppLayout } from '@/components/layout/app-layout'
import { MeetingForm, CreateMeetingFormPayload } from '@/components/calendar/MeetingForm'
import { ArrowLeft, ShieldAlert, Loader2, AlertCircle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface EditMeetingPageProps {
  meetingId?: string
}

function EditMeetingPageContent({ meetingId }: EditMeetingPageProps) {
  const router = useRouter()
  const params = useParams()
  const id = meetingId || (params?.id as string)

  const { hasPermission } = usePermission()
  const canUpdate = hasPermission('meeting.update')

  const { data: meeting, isLoading, isError } = useMeeting(id)
  const updateMeetingMutation = useUpdateMeeting()
  const { data: employees = [] } = useEmployees()
  const { data: projects = [] } = useProjects()

  const handleSubmit = async (values: CreateMeetingFormPayload) => {
    if (!id) return
    try {
      await updateMeetingMutation.mutateAsync({ id, payload: values })
      router.push(`/meetings/${id}`)
    } catch (error) {
      console.error(error)
    }
  }

  if (!canUpdate) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <ShieldAlert size={48} className="text-destructive animate-pulse" />
          <h3 className="text-xl font-bold text-foreground">Access Restricted</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            You do not possess the necessary access token to edit scheduled meetings.
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
            The requested meeting details could not be resolved.
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
      <div className="space-y-6 max-w-3xl mx-auto">
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

        {/* Header Title */}
        <div className="border-b border-border/20 pb-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Edit Scheduled Meeting</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Update parameter configurations, agenda list, or change participant rolls.
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-md">
          <MeetingForm
            initialValues={meeting}
            projects={projects}
            employees={employees}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/meetings/${id}`)}
            isSubmitting={updateMeetingMutation.isPending}
          />
        </div>
      </div>
    </AppLayout>
  )
}

export default function EditMeetingPage(props: EditMeetingPageProps) {
  return (
    <QueryProvider>
      <PermissionProvider>
        <EditMeetingPageContent {...props} />
      </PermissionProvider>
    </QueryProvider>
  )
}

export { EditMeetingPage }
