'use client'

import { useState, useMemo } from 'react'
import { CalendarView, CalendarFilters as ICalendarFilters, CalendarEvent, EventType } from '@/types/calendar'
import { Meeting, CreateMeetingPayload } from '@/types/meeting'
import { useCalendarEvents, useCreateCalendarEvent, useUpdateCalendarEvent, useDeleteCalendarEvent } from '@/hooks/useCalendar'
import { useMeetings, useCreateMeeting, useUpdateMeeting, useDeleteMeeting } from '@/hooks/useMeetings'
import { useEmployees } from '@/hooks/useEmployees'
import { useProjects } from '@/hooks/useProjects'
import { usePermission } from '@/components/providers/permission-provider'
import { AppLayout } from '@/components/layout/app-layout'

import { CalendarHeader } from './CalendarHeader'
import { CalendarToolbar } from './CalendarToolbar'
import { CalendarLegend } from './CalendarLegend'
import { CalendarSidebar } from './CalendarSidebar'
import { CalendarFilters } from './CalendarFilters'
import { CalendarMonth } from './CalendarMonth'
import { CalendarWeek } from './CalendarWeek'
import { CalendarDay } from './CalendarDay'
import { CalendarAgenda } from './CalendarAgenda'

import { EventDetailDrawer } from './EventDetailDrawer'
import { CreateMeetingDialog } from './CreateMeetingDialog'
import { DeleteMeetingDialog } from './DeleteMeetingDialog'

import { AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function CalendarPageContent() {
  const { hasPermission } = usePermission()

  // Guard access
  const canView = hasPermission('calendar.view')
  const canCreateEvent = hasPermission('calendar.create')
  const canUpdateEvent = hasPermission('calendar.update')
  const canDeleteEvent = hasPermission('calendar.delete')
  const canCreateMeeting = hasPermission('meeting.create')
  const canUpdateMeeting = hasPermission('meeting.update')
  const canDeleteMeeting = hasPermission('meeting.delete')

  // Date and View State
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [view, setView] = useState<CalendarView>('month')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Filters State
  const [filterTypes, setFilterTypes] = useState<EventType[]>([])
  const [filterProjects, setFilterProjects] = useState<string[]>([])
  const [filterEmployees, setFilterEmployees] = useState<string[]>([])
  const [filterDepartments, setFilterDepartments] = useState<string[]>([])

  // Query Parameters
  const calendarParams = useMemo(() => {
    // Generate dates based on current view/date
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString()
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString()
    return {
      start,
      end,
      search: searchQuery || undefined,
    }
  }, [currentDate, searchQuery])

  // Data Fetching
  const { data: rawEvents = [], isLoading: eventsLoading, isError: eventsError } = useCalendarEvents(calendarParams)
  const { data: rawMeetings = [], isLoading: meetingsLoading } = useMeetings()
  const { data: employees = [] } = useEmployees()
  const { data: projects = [] } = useProjects()

  // Mutations
  const createEventMutation = useCreateCalendarEvent()
  const updateEventMutation = useUpdateCalendarEvent()
  const deleteEventMutation = useDeleteCalendarEvent()

  const createMeetingMutation = useCreateMeeting()
  const updateMeetingMutation = useUpdateMeeting()
  const deleteMeetingMutation = useDeleteMeeting()

  // Selected details drawer
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  
  // Dialog Open States
  const [isMeetingCreateOpen, setIsMeetingCreateOpen] = useState(false)
  const [isEventCreateOpen, setIsEventCreateOpen] = useState(false)
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null)

  // Create Event Form Values (Internal Modal)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDesc, setNewEventDesc] = useState('')
  const [newEventType, setNewEventType] = useState<EventType>('task')
  const [newEventStart, setNewEventStart] = useState('')
  const [newEventEnd, setNewEventEnd] = useState('')
  const [newEventProjId, setNewEventProjId] = useState('')

  // Handle Event Reset Filters
  const handleResetFilters = () => {
    setFilterTypes([])
    setFilterProjects([])
    setFilterEmployees([])
    setFilterDepartments([])
  }

  // Combined Calendar Events
  const filteredEvents = useMemo(() => {
    let result = [...rawEvents]

    // Apply client-side filters
    if (filterTypes.length > 0) {
      result = result.filter((e) => filterTypes.includes(e.event_type))
    }
    if (filterProjects.length > 0) {
      result = result.filter((e) => e.project_id && filterProjects.includes(e.project_id))
    }
    if (filterEmployees.length > 0) {
      result = result.filter((e) => e.participants?.some((p) => filterEmployees.includes(p)))
    }
    if (filterDepartments.length > 0) {
      result = result.filter((e) => {
        // Find if any participant belongs to the selected departments
        return e.attendees?.some((att) => att.department_id && filterDepartments.includes(att.department_id))
      })
    }

    return result
  }, [rawEvents, filterTypes, filterProjects, filterEmployees, filterDepartments])

  // Handle meeting scheduling submission
  const handleCreateMeetingSubmit = async (payload: any) => {
    try {
      await createMeetingMutation.mutateAsync(payload as CreateMeetingPayload)
      setIsMeetingCreateOpen(false)
    } catch (error) {
      console.error(error)
    }
  }

  // Handle general event creation
  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventTitle || !newEventStart || !newEventEnd) return

    try {
      await createEventMutation.mutateAsync({
        title: newEventTitle,
        description: newEventDesc,
        event_type: newEventType,
        start: new Date(newEventStart).toISOString(),
        end: new Date(newEventEnd).toISOString(),
        project_id: newEventProjId || undefined,
      })
      setIsEventCreateOpen(false)
      // reset
      setNewEventTitle('')
      setNewEventDesc('')
      setNewEventType('task')
      setNewEventStart('')
      setNewEventEnd('')
      setNewEventProjId('')
    } catch (error) {
      console.error(error)
    }
  }

  // Handle meeting cancel confirmation
  const handleDeleteMeetingConfirm = async () => {
    if (!meetingToDelete) return
    try {
      await deleteMeetingMutation.mutateAsync(meetingToDelete.id)
      setMeetingToDelete(null)
      setSelectedEvent(null)
    } catch (error) {
      console.error(error)
    }
  }

  if (!canView) {
    return (
      <AppLayout>
        <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center">
          <ShieldAlert size={48} className="text-destructive animate-pulse" />
          <h3 className="text-xl font-bold text-foreground">Access Restricted</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            You do not possess the <code>calendar.view</code> authorization token required to load this module. Contact your tenant administrator.
          </p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <CalendarHeader />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar / Filters Column */}
          <div className="flex flex-col gap-6 lg:w-72 shrink-0">
            {/* Action Center - Small Create Buttons */}
            {canCreateMeeting && (
              <button
                onClick={() => setIsMeetingCreateOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-accent-foreground hover:opacity-90 transition-all shadow-md"
              >
                Schedule Meeting
              </button>
            )}

            <CalendarSidebar
              currentDate={currentDate}
              events={filteredEvents}
              onSelectDate={(d) => {
                setCurrentDate(d)
                setSelectedDate(d)
              }}
              onSelectEvent={setSelectedEvent}
            />

            {showFilters && (
              <CalendarFilters
                selectedTypes={filterTypes}
                onTypesChange={setFilterTypes}
                selectedProjects={filterProjects}
                onProjectsChange={setFilterProjects}
                selectedEmployees={filterEmployees}
                onEmployeesChange={setFilterEmployees}
                selectedDepartments={filterDepartments}
                onDepartmentsChange={setFilterDepartments}
                projects={projects}
                employees={employees}
                departments={[]}
                onReset={handleResetFilters}
              />
            )}
          </div>

          {/* Main Calendar View Column */}
          <div className="flex-1 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden flex flex-col min-h-[750px]">
            <CalendarToolbar
              currentDate={currentDate}
              view={view}
              searchQuery={searchQuery}
              onDateChange={setCurrentDate}
              onViewChange={setView}
              onSearchChange={setSearchQuery}
              onCreateEvent={() => setIsEventCreateOpen(true)}
              onCreateMeeting={() => setIsMeetingCreateOpen(true)}
              onToggleFilters={() => setShowFilters(!showFilters)}
              isLoading={eventsLoading || meetingsLoading}
            />

            <div className="p-4 border-b border-border/20">
              <CalendarLegend />
            </div>

            <div className="flex-1 min-h-[600px]">
              {eventsError ? (
                <div className="flex h-96 flex-col items-center justify-center gap-3 text-center p-6">
                  <AlertCircle size={36} className="text-destructive animate-bounce" />
                  <p className="text-sm font-bold text-foreground">API Sync Error</p>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Unable to fetch calendar sync details. Confirm backend endpoint status.
                  </p>
                </div>
              ) : view === 'month' ? (
                <CalendarMonth
                  currentDate={currentDate}
                  events={filteredEvents}
                  selectedDate={selectedDate}
                  onSelectDate={(d) => {
                    setCurrentDate(d)
                    setSelectedDate(d)
                  }}
                  onSelectEvent={setSelectedEvent}
                />
              ) : view === 'week' ? (
                <CalendarWeek
                  currentDate={currentDate}
                  events={filteredEvents}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  onSelectEvent={setSelectedEvent}
                />
              ) : view === 'day' ? (
                <CalendarDay
                  currentDate={currentDate}
                  events={filteredEvents}
                  onSelectEvent={setSelectedEvent}
                />
              ) : (
                <CalendarAgenda
                  currentDate={currentDate}
                  events={filteredEvents}
                  onSelectEvent={setSelectedEvent}
                />
              )}
            </div>
          </div>
        </div>

        {/* Detailed Event Drawer */}
        <EventDetailDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={
            canDeleteMeeting && selectedEvent?.event_type === 'meeting'
              ? () => {
                  const mtg = rawMeetings.find((m) => m.id === selectedEvent.meeting_id)
                  if (mtg) setMeetingToDelete(mtg)
                }
              : canDeleteEvent
              ? (e) => deleteEventMutation.mutate(e.id)
              : undefined
          }
        />

        {/* Create Meeting Dialog */}
        <CreateMeetingDialog
          isOpen={isMeetingCreateOpen}
          onClose={() => setIsMeetingCreateOpen(false)}
          projects={projects}
          employees={employees}
          onSubmit={handleCreateMeetingSubmit}
          isSubmitting={createMeetingMutation.isPending}
        />

        {/* Delete Meeting Confirmation Dialog */}
        <DeleteMeetingDialog
          isOpen={!!meetingToDelete}
          onClose={() => setMeetingToDelete(null)}
          onConfirm={handleDeleteMeetingConfirm}
          meetingTitle={meetingToDelete?.title ?? ''}
          isDeleting={deleteMeetingMutation.isPending}
        />

        {/* Create General Event Dialog */}
        <AnimatePresence>
          {isEventCreateOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                onClick={() => setIsEventCreateOpen(false)}
              />

              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full max-w-md rounded-2xl border border-border/40 bg-card/95 p-6 backdrop-blur-xl shadow-2xl space-y-5"
                >
                  <h3 className="text-base font-bold text-foreground">Schedule General Event</h3>

                  <form onSubmit={handleCreateEventSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Event Title</label>
                      <input
                        type="text"
                        required
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="Company Hackathon / Outing"
                        className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
                      <textarea
                        value={newEventDesc}
                        onChange={(e) => setNewEventDesc(e.target.value)}
                        placeholder="Details about the holiday, deadline, or leave..."
                        className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Type</label>
                        <select
                          value={newEventType}
                          onChange={(e) => setNewEventType(e.target.value as EventType)}
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                        >
                          <option value="task">Task Due</option>
                          <option value="deadline">Project Deadline</option>
                          <option value="reminder">Reminder</option>
                          <option value="leave">Employee Leave</option>
                          <option value="holiday">Holiday</option>
                          <option value="company_event">Company Event</option>
                          <option value="birthday">Birthday</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Associated Project</label>
                        <select
                          value={newEventProjId}
                          onChange={(e) => setNewEventProjId(e.target.value)}
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                        >
                          <option value="">None</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Starts At</label>
                        <input
                          type="datetime-local"
                          required
                          value={newEventStart}
                          onChange={(e) => setNewEventStart(e.target.value)}
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Ends At</label>
                        <input
                          type="datetime-local"
                          required
                          value={newEventEnd}
                          onChange={(e) => setNewEventEnd(e.target.value)}
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsEventCreateOpen(false)}
                        className="rounded-xl border border-border/40 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createEventMutation.isPending}
                        className="rounded-xl bg-accent px-5 py-2 text-xs font-bold text-accent-foreground hover:opacity-90 disabled:opacity-50"
                      >
                        Create Event
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
export default CalendarPageContent
