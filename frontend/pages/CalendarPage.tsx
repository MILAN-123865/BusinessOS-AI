'use client'

import { CalendarPageContent } from '@/components/calendar/CalendarPage'
import { QueryProvider } from '@/components/providers/query-provider'
import { PermissionProvider } from '@/components/providers/permission-provider'

export default function CalendarPage() {
  return (
    <QueryProvider>
      <PermissionProvider>
        <CalendarPageContent />
      </PermissionProvider>
    </QueryProvider>
  )
}
export { CalendarPage }
