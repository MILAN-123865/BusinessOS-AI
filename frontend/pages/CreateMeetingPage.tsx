'use client'

import { useCreateMeeting } from '@/hooks/useCreateMeeting'
import { useEmployees } from '@/hooks/useEmployees'
import { useProjects } from '@/hooks/useProjects'
import { usePermission, PermissionProvider } from '@/components/providers/permission-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { AppLayout } from '@/components/layout/app-layout'
import { MeetingForm, CreateMeetingFormPayload } from '@/components/calendar/MeetingForm'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'

function CreateMeetingPageContent() {
  const router = useRouter()
  const { hasPermission } = usePermission()
  
  const canCreate = hasPermission('meeting.create')
  
  const createMeetingMutation = useCreateMeeting()
  const { data: employees = [] } = useEmployees()
  const { data: projects = [] } = useProjects()

  const handleSubmit = async (values: CreateMeetingFormPayload) => {
    try {
      await createMeetingMutation.mutateAsync(values)
      router.push('/calendar')
    } catch (error) {
      console.error(error)
    }
  }

  if (!canCreate) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <ShieldAlert size={48} className="text-destructive animate-pulse" />
          <h3 className="text-xl font-bold text-foreground">Access Restricted</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            You do not possess the necessary access token to schedule a meeting.
          </p>
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
            Back to Calendar
          </button>
        </div>

        {/* Header Title */}
        <div className="border-b border-border/20 pb-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Schedule Meeting</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Setup meeting title, agenda, and invite teammates or clients.
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-border/40 bg-card/30 p-6 backdrop-blur-md">
          <MeetingForm
            projects={projects}
            employees={employees}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/calendar')}
            isSubmitting={createMeetingMutation.isPending}
          />
        </div>
      </div>
    </AppLayout>
  )
}

export default function CreateMeetingPage() {
  return (
    <QueryProvider>
      <PermissionProvider>
        <CreateMeetingPageContent />
      </PermissionProvider>
    </QueryProvider>
  )
}

export { CreateMeetingPage }
