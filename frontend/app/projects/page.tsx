'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { useAuthStore } from '@/store/authStore'
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useAddProjectMember,
  useRemoveProjectMember,
  useCreateProjectMilestone,
  useUpdateProjectMilestone,
  useDeleteProjectMilestone,
} from '@/hooks/useProjects'
import { useClients } from '@/hooks/useClients'
import { useEmployees } from '@/hooks/useEmployees'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderKanban,
  Plus,
  Trash2,
  Edit2,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Users,
  Flag,
  ListTodo,
  List,
  TrendingUp,
  Trash,
  UserPlus,
  Check,
  ArrowUpDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  project_code: z.string().max(100).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  client_id: z.string().min(1, 'Client is required'),
  status: z.string().default('Planning'),
  priority: z.string().default('Medium'),
  budget: z.preprocess((val) => Number(val) || 0, z.number().min(0)),
  currency: z.string().default('USD'),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  estimated_hours: z.preprocess((val) => Number(val) || 0, z.number().min(0)),
  actual_hours: z.preprocess((val) => Number(val) || 0, z.number().min(0)),
  progress: z.preprocess((val) => Number(val) || 0, z.number().min(0).max(100)),
  health: z.string().default('Good'),
  project_manager_id: z.string().optional().or(z.literal('')),
})

type ProjectFormValues = z.infer<typeof projectSchema>

const milestoneSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(500).optional().or(z.literal('')),
  due_date: z.string().optional().or(z.literal('')),
  status: z.string().default('Pending'),
})

type MilestoneFormValues = z.infer<typeof milestoneSchema>

export default function ProjectsPage() {
  const user = useAuthStore((state) => state.user)

  // React Query Hooks
  const { data: projects = [], isLoading: projectsLoading, isError: projectsError } = useProjects()
  const { data: clients = [] } = useClients()
  const { data: employees = [] } = useEmployees()

  const createProjectMutation = useCreateProject()
  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()

  const addMemberMutation = useAddProjectMember()
  const removeMemberMutation = useRemoveProjectMember()

  const createMilestoneMutation = useCreateProjectMilestone()
  const updateMilestoneMutation = useUpdateProjectMilestone()
  const deleteMilestoneMutation = useDeleteProjectMilestone()

  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Directory Filter configurations
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedPriority, setSelectedPriority] = useState('All')
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list')
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Modals configurations
  const [isProjectOpen, setIsProjectOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any | null>(null)
  const [activeMembersProject, setActiveMembersProject] = useState<any | null>(null)
  const [activeMilestonesProject, setActiveMilestonesProject] = useState<any | null>(null)

  // Team members adding configurations
  const [memberUserId, setMemberUserId] = useState('')
  const [memberRole, setMemberRole] = useState('')

  // Project Form
  const {
    register: registerProject,
    handleSubmit: handleProjectSubmit,
    reset: resetProject,
    formState: { errors: projectErrors },
  } = useForm<any>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      project_code: '',
      description: '',
      client_id: '',
      status: 'Planning',
      priority: 'Medium',
      budget: 0,
      currency: 'USD',
      start_date: '',
      end_date: '',
      estimated_hours: 0,
      actual_hours: 0,
      progress: 0,
      health: 'Good',
      project_manager_id: '',
    },
  })

  // Milestone Form
  const {
    register: registerMilestone,
    handleSubmit: handleMilestoneSubmit,
    reset: resetMilestone,
    formState: { errors: milestoneErrors },
  } = useForm<any>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      name: '',
      description: '',
      due_date: '',
      status: 'Pending',
    },
  })

  const onProjectFormSubmit = async (data: any) => {
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      const payload = {
        ...data,
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
        project_manager_id: data.project_manager_id || undefined,
      }

      if (editingProject) {
        await updateProjectMutation.mutateAsync({
          id: editingProject.id,
          payload,
        })
        setSuccessMsg(`Project '${data.name}' updated successfully.`)
        setEditingProject(null)
      } else {
        await createProjectMutation.mutateAsync({
          ...payload,
          organization_id: user?.organization_id || '',
        })
        setSuccessMsg(`Project '${data.name}' created successfully.`)
        setIsProjectOpen(false)
      }
      resetProject()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Project save failed.')
    }
  }

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete project '${name}'?`)) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await deleteProjectMutation.mutateAsync(id)
      setSuccessMsg(`Project '${name}' deleted successfully.`)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Project deletion failed.')
    }
  }

  const handleOpenEditProject = (project: any) => {
    setEditingProject(project)
    setIsProjectOpen(false)
    resetProject({
      name: project.name,
      project_code: project.project_code || '',
      description: project.description || '',
      client_id: project.client_id,
      status: project.status,
      priority: project.priority,
      budget: project.budget,
      currency: project.currency,
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      estimated_hours: project.estimated_hours,
      actual_hours: project.actual_hours,
      progress: project.progress,
      health: project.health,
      project_manager_id: project.project_manager_id || '',
    })
  }

  // Nested Members
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeMembersProject || !memberUserId) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await addMemberMutation.mutateAsync({
        projectId: activeMembersProject.id,
        payload: {
          user_id: memberUserId,
          role: memberRole || undefined,
        },
      })
      setSuccessMsg('Team member assigned successfully.')
      setMemberUserId('')
      setMemberRole('')
      
      const updated = projects.find((p) => p.id === activeMembersProject.id)
      if (updated) setActiveMembersProject(updated)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Member assignment failed.')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!activeMembersProject) return
    if (!confirm('Remove this member from the project?')) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await removeMemberMutation.mutateAsync({
        projectId: activeMembersProject.id,
        memberId,
      })
      setSuccessMsg('Member removed successfully.')
      
      const updated = projects.find((p) => p.id === activeMembersProject.id)
      if (updated) setActiveMembersProject(updated)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Remove member failed.')
    }
  }

  // Nested Milestones
  const handleMilestoneFormSubmit = async (data: any) => {
    if (!activeMilestonesProject) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await createMilestoneMutation.mutateAsync({
        projectId: activeMilestonesProject.id,
        payload: {
          name: data.name,
          description: data.description || undefined,
          due_date: data.due_date || undefined,
          status: data.status,
        },
      })
      setSuccessMsg(`Milestone '${data.name}' registered successfully.`)
      resetMilestone()
      
      const updated = projects.find((p) => p.id === activeMilestonesProject.id)
      if (updated) setActiveMilestonesProject(updated)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Milestone creation failed.')
    }
  }

  const handleToggleMilestone = async (milestone: any) => {
    if (!activeMilestonesProject) return
    setSuccessMsg(null)
    setErrorMsg(null)
    const nextStatus = milestone.status === 'Completed' ? 'Pending' : 'Completed'
    try {
      await updateMilestoneMutation.mutateAsync({
        projectId: activeMilestonesProject.id,
        milestoneId: milestone.id,
        payload: { status: nextStatus },
      })
      setSuccessMsg('Milestone status toggled.')
      
      const updated = projects.find((p) => p.id === activeMilestonesProject.id)
      if (updated) setActiveMilestonesProject(updated)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Toggle milestone failed.')
    }
  }

  const handleDeleteMilestone = async (milestoneId: string, name: string) => {
    if (!activeMilestonesProject) return
    if (!confirm(`Delete milestone '${name}'?`)) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await deleteMilestoneMutation.mutateAsync({
        projectId: activeMilestonesProject.id,
        milestoneId,
      })
      setSuccessMsg(`Milestone '${name}' removed.`)
      
      const updated = projects.find((p) => p.id === activeMilestonesProject.id)
      if (updated) setActiveMilestonesProject(updated)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Delete milestone failed.')
    }
  }

  // Filter project lists
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.project_code || '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus
    const matchesPriority = selectedPriority === 'All' || p.priority === selectedPriority

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Helper to get priority weight for sorting
  const getPriorityWeight = (priority: string) => {
    switch (priority) {
      case 'Critical': return 4
      case 'High': return 3
      case 'Medium': return 2
      case 'Low': return 1
      default: return 0
    }
  }

  // Sort filtered projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (!sortField) return 0

    let valA: any = ''
    let valB: any = ''

    if (sortField === 'name') {
      valA = a.name.toLowerCase()
      valB = b.name.toLowerCase()
    } else if (sortField === 'client') {
      valA = (a.client?.company_name || '').toLowerCase()
      valB = (b.client?.company_name || '').toLowerCase()
    } else if (sortField === 'progress') {
      valA = a.progress || 0
      valB = b.progress || 0
    } else if (sortField === 'priority') {
      valA = getPriorityWeight(a.priority)
      valB = getPriorityWeight(b.priority)
    } else if (sortField === 'budget') {
      valA = a.budget || 0
      valB = b.budget || 0
    } else if (sortField === 'end_date') {
      valA = a.end_date ? new Date(a.end_date).getTime() : 0
      valB = b.end_date ? new Date(b.end_date).getTime() : 0
    } else if (sortField === 'status') {
      valA = (a.status || '').toLowerCase()
      valB = (b.status || '').toLowerCase()
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const renderSortableHeader = (label: string, field: string, className = "px-6 py-4") => {
    const isSorted = sortField === field
    return (
      <th 
        className={`${className} cursor-pointer select-none group hover:bg-card/30 transition-colors`}
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          <ArrowUpDown 
            size={12} 
            className={`transition-all ${
              isSorted 
                ? 'text-accent scale-110 opacity-100' 
                : 'text-muted-foreground opacity-30 group-hover:opacity-75'
            } ${isSorted && sortDirection === 'desc' ? 'rotate-180' : ''}`} 
          />
        </div>
      </th>
    )
  }

  // Timeline dates computation for Gantt chart
  const projectsWithDates = sortedProjects.filter((p) => p.start_date && p.end_date)
  
  // Default bounds (current month to 4 months out)
  let minDate = new Date()
  minDate.setDate(1) // Start of current month
  let maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 4)
  maxDate.setDate(0) // End of that month

  if (projectsWithDates.length > 0) {
    try {
      const startDates = projectsWithDates.map((p) => new Date(p.start_date))
      const endDates = projectsWithDates.map((p) => new Date(p.end_date))
      
      const absoluteMin = new Date(Math.min(...startDates.map((d) => d.getTime())))
      const absoluteMax = new Date(Math.max(...endDates.map((d) => d.getTime())))
      
      // Pad by a month on each end for a better viewport buffer
      minDate = new Date(absoluteMin.getFullYear(), absoluteMin.getMonth() - 1, 1)
      maxDate = new Date(absoluteMax.getFullYear(), absoluteMax.getMonth() + 2, 0)
    } catch (e) {
      // Graceful fallback
    }
  }

  // Calculate the total number of days in the range
  const totalDays = Math.max(1, (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))

  // Generate an array of months to render headers and grid columns
  const getMonths = () => {
    const months: { date: Date; name: string; year: number; days: number; startDayOffset: number; widthPercent: number }[] = []
    let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    
    while (current <= maxDate) {
      const year = current.getFullYear()
      const monthIndex = current.getMonth()
      const monthName = current.toLocaleDateString('en-US', { month: 'long' })
      
      // Calculate days in this month
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
      
      // Calculate actual days of this month that fall within our min/max timeline boundary
      const monthStart = new Date(year, monthIndex, 1)
      const monthEnd = new Date(year, monthIndex, daysInMonth)
      
      const clampStart = monthStart < minDate ? minDate : monthStart
      const clampEnd = monthEnd > maxDate ? maxDate : monthEnd
      const overlapDays = Math.max(0, (clampEnd.getTime() - clampStart.getTime()) / (1000 * 60 * 60 * 24) + 1)
      
      const leftOffset = Math.max(0, (clampStart.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
      const widthPercent = (overlapDays / totalDays) * 100

      if (overlapDays > 0) {
        months.push({
          date: new Date(current),
          name: monthName,
          year,
          days: overlapDays,
          startDayOffset: leftOffset,
          widthPercent,
        })
      }
      
      // Move to next month
      current.setMonth(current.getMonth() + 1)
    }
    return months
  }

  const monthsArray = getMonths()

  // Calculate Today position
  const today = new Date()
  let todayPercent: number | null = null
  if (today >= minDate && today <= maxDate) {
    const todayOffset = (today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    todayPercent = (todayOffset / totalDays) * 100
  }

  const getProjectBarStyles = (project: any) => {
    if (!project.start_date || !project.end_date) {
      return { left: '0%', width: '0%', display: 'none' }
    }
    
    try {
      const pStart = new Date(project.start_date)
      const pEnd = new Date(project.end_date)
      
      // Clamp values within minDate and maxDate to avoid overflow issues
      const clampStart = pStart < minDate ? minDate : pStart
      const clampEnd = pEnd > maxDate ? maxDate : pEnd
      
      const leftOffset = Math.max(0, (clampStart.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
      const duration = Math.max(1, (clampEnd.getTime() - clampStart.getTime()) / (1000 * 60 * 60 * 24))
      
      const leftPercent = (leftOffset / totalDays) * 100
      const widthPercent = (duration / totalDays) * 100
      
      return {
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        display: 'block'
      }
    } catch (e) {
      return { left: '0%', width: '0%', display: 'none' }
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Project Management</h1>
            <p className="mt-2 text-muted-foreground">Supervise team members assignments, linear progress bars, and milestones.</p>
          </div>
          {!projectsLoading && !projectsError && (
            <button
              onClick={() => {
                setIsProjectOpen(true)
                setEditingProject(null)
                resetProject({
                  name: '',
                  project_code: '',
                  description: '',
                  client_id: clients[0]?.id || '',
                  status: 'Planning',
                  priority: 'Medium',
                  budget: 0,
                  currency: 'USD',
                  start_date: '',
                  end_date: '',
                  estimated_hours: 0,
                  actual_hours: 0,
                  progress: 0,
                  health: 'Good',
                  project_manager_id: '',
                })
              }}
              className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all self-start"
            >
              <Plus size={16} />
              <span>Create Project</span>
            </button>
          )}
        </div>

        {/* Success/Error Alerts */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400"
          >
            <CheckCircle size={20} />
            <span className="text-sm font-medium">{successMsg}</span>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive-foreground"
          >
            <AlertCircle size={20} className="text-destructive" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </motion.div>
        )}

        {projectsLoading ? (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-card/40 animate-pulse border border-border/40" />
              ))}
            </div>
            <div className="h-96 rounded-xl bg-card/40 animate-pulse border border-border/40" />
          </div>
        ) : projectsError ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle size={48} className="text-destructive animate-bounce" />
            <h3 className="text-xl font-bold text-foreground">API Connection Error</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Failed to query operational project management schemas. Ensure active reload servers.
            </p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                    <p className="text-3xl font-bold">{projects.length}</p>
                  </div>
                  <div className="rounded-lg bg-primary/20 p-3">
                    <FolderKanban size={24} className="text-accent" />
                  </div>
                </CardContent>
              </Card>

              {/* Projects by Status Summary Card */}
              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex flex-col justify-center h-full">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Projects by Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 bg-background/30 px-2 py-1 rounded-lg border border-border/10">
                      <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                      <span className="text-[10px] font-semibold text-muted-foreground">Planning:</span>
                      <span className="text-[10px] font-bold text-foreground ml-auto">
                        {projects.filter((p) => p.status === 'Planning').length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-background/30 px-2 py-1 rounded-lg border border-border/10">
                      <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                      <span className="text-[10px] font-semibold text-muted-foreground">Active:</span>
                      <span className="text-[10px] font-bold text-foreground ml-auto">
                        {projects.filter((p) => p.status === 'Active').length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-background/30 px-2 py-1 rounded-lg border border-border/10">
                      <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                      <span className="text-[10px] font-semibold text-muted-foreground">On Hold:</span>
                      <span className="text-[10px] font-bold text-foreground ml-auto">
                        {projects.filter((p) => p.status === 'On Hold').length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-background/30 px-2 py-1 rounded-lg border border-border/10">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-[10px] font-semibold text-muted-foreground">Done:</span>
                      <span className="text-[10px] font-bold text-foreground ml-auto">
                        {projects.filter((p) => p.status === 'Completed').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                    <p className="text-3xl font-bold">
                      {projects.filter((p) => p.status === 'Active').length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/20 p-3">
                    <TrendingUp size={24} className="text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Financial Allocations</p>
                    <p className="text-3xl font-bold">
                      ${projects.reduce((acc, p) => acc + p.budget, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/20 p-3">
                    <DollarSign size={24} className="text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/40 bg-card/20 p-4 backdrop-blur-md">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search by project name or internal code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border/40 bg-background/50 py-2 pl-10 pr-4 text-sm text-foreground outline-none focus:border-accent"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1 border border-border/40 bg-background/30 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-accent text-[#0B1220]'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <List size={14} />
                    <span>List View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('timeline')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      viewMode === 'timeline'
                        ? 'bg-accent text-[#0B1220]'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Calendar size={14} />
                    <span>Timeline View</span>
                  </button>
                </div>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                >
                  <option value="All">All Statuses</option>
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Conditional Views */}
            {viewMode === 'list' ? (
              <div className="overflow-x-auto rounded-2xl border border-border/40 bg-card/20 backdrop-blur-md">
                <table className="w-full border-collapse text-left text-sm text-foreground">
                  <thead className="bg-card/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border/40">
                    <tr>
                      {renderSortableHeader('Project', 'name')}
                      {renderSortableHeader('Client', 'client')}
                      {renderSortableHeader('Progress', 'progress')}
                      {renderSortableHeader('Priority', 'priority')}
                      {renderSortableHeader('Budget', 'budget')}
                      {renderSortableHeader('Deadline', 'end_date')}
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {sortedProjects.map((project) => {
                      const managerInitials = project.project_manager
                        ? `${project.project_manager.first_name[0] || ''}${project.project_manager.last_name[0] || ''}`
                        : 'N/A'

                      return (
                        <tr key={project.id} className="hover:bg-card/15 transition-all">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-foreground">{project.name}</p>
                              {project.project_code && (
                                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{project.project_code}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {project.client ? (
                              <Badge variant="outline" className="border-border/40 capitalize text-xs">
                                {project.client.company_name}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">None Assigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-accent h-full rounded-full transition-all"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-foreground shrink-0">{project.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              className={`border-0 text-xs font-semibold uppercase ${
                                project.priority === 'Critical'
                                  ? 'bg-destructive/15 text-destructive-foreground'
                                  : project.priority === 'High'
                                  ? 'bg-orange-500/10 text-orange-400'
                                  : 'bg-primary/20 text-accent'
                              }`}
                            >
                              {project.priority}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 font-semibold text-foreground">
                            {project.budget ? `${project.currency} ${project.budget.toLocaleString()}` : 'Free / Internal'}
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground">
                            {project.end_date ? (
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {project.end_date}
                              </span>
                            ) : (
                              <span className="italic">No Date Set</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-3 text-xs font-semibold">
                              <button
                                onClick={() => handleOpenEditProject(project)}
                                className="text-accent hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMembersProject(project)
                                  setMemberUserId('')
                                  setMemberRole('')
                                }}
                                className="text-accent hover:underline"
                              >
                                Team ({project.members?.length || 0})
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMilestonesProject(project)
                                  resetMilestone()
                                }}
                                className="text-accent hover:underline"
                              >
                                Milestones ({project.milestones?.length || 0})
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id, project.name)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* GANTT TIMELINE VIEW */
              <div className="rounded-2xl border border-border/40 bg-card/20 backdrop-blur-md overflow-hidden flex flex-col md:flex-row">
                
                {/* Fixed Left Column - Project Directory */}
                <div className="w-full md:w-80 shrink-0 border-r border-border/20 bg-card/10 z-10">
                  <div className="h-14 border-b border-border/30 px-4 flex items-center bg-card/30">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Details</span>
                  </div>
                  <div className="divide-y divide-border/10">
                    {sortedProjects.map((project) => (
                      <div key={project.id} className="h-16 px-4 flex flex-col justify-center hover:bg-card/10 transition-colors">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="font-bold text-sm text-foreground truncate max-w-[180px]" title={project.name}>
                            {project.name}
                          </span>
                          <Badge
                            className={`border-0 text-[10px] font-semibold uppercase px-1.5 py-0.5 ${
                              project.status === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : project.status === 'Active'
                                ? 'bg-accent/15 text-accent'
                                : project.status === 'On Hold'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-slate-500/15 text-slate-400'
                            }`}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5">
                          <span>{project.client?.company_name || 'No Client'}</span>
                          <span>{project.progress}% completed</span>
                        </div>
                      </div>
                    ))}
                    {sortedProjects.length === 0 && (
                      <div className="p-8 text-center text-xs text-muted-foreground italic">
                        No projects found matching filters.
                      </div>
                    )}
                  </div>
                </div>

                {/* Scrollable Right Column - Timeline Grid */}
                <div className="flex-1 overflow-x-auto relative min-h-[300px]">
                  <div className="min-w-[800px] relative">
                    
                    {/* Header: Months */}
                    <div className="h-14 border-b border-border/30 flex relative bg-card/30">
                      {monthsArray.map((m, idx) => (
                        <div
                          key={idx}
                          className="h-full border-r border-border/10 flex flex-col justify-center px-3 shrink-0"
                          style={{ width: `${m.widthPercent}%` }}
                        >
                          <span className="text-xs font-bold text-foreground truncate">{m.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{m.year}</span>
                        </div>
                      ))}
                    </div>

                    {/* Timeline Body Rows */}
                    <div className="relative divide-y divide-border/10">
                      
                      {/* Grid Background Columns */}
                      <div className="absolute inset-0 flex pointer-events-none z-0">
                        {monthsArray.map((m, idx) => (
                          <div
                            key={idx}
                            className="h-full border-r border-border/10 shrink-0 bg-card/[0.02]"
                            style={{ width: `${m.widthPercent}%` }}
                          />
                        ))}
                      </div>

                      {/* Today Indicator Line */}
                      {todayPercent !== null && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed border-rose-500/80 z-20 pointer-events-none"
                          style={{ left: `${todayPercent}%` }}
                        >
                          <div className="absolute top-0 -translate-x-1/2 bg-rose-500 text-[8px] font-extrabold text-white px-1 py-0.5 rounded shadow-sm uppercase tracking-wider">
                            Today
                          </div>
                        </div>
                      )}

                      {/* Projects Bars */}
                      {sortedProjects.map((project) => {
                        const barStyles = getProjectBarStyles(project);
                        const hasDates = project.start_date && project.end_date;

                        // Status Color Classes
                        let statusColorClasses = "bg-slate-500/20 text-slate-300 border-slate-500/30";
                        let fillAccentClass = "bg-slate-400/20";
                        if (project.status === 'Active') {
                          statusColorClasses = "bg-primary/20 text-accent border-accent/30 shadow-[0_0_12px_rgba(var(--accent-rgb),0.1)]";
                          fillAccentClass = "bg-accent/20";
                        } else if (project.status === 'On Hold') {
                          statusColorClasses = "bg-amber-500/20 text-amber-300 border-amber-500/30";
                          fillAccentClass = "bg-amber-500/20";
                        } else if (project.status === 'Completed') {
                          statusColorClasses = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
                          fillAccentClass = "bg-emerald-500/20";
                        }

                        return (
                          <div key={project.id} className="h-16 relative flex items-center z-10">
                            {hasDates ? (
                              <div
                                style={barStyles}
                                className="absolute h-9 rounded-xl border flex items-center cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md select-none group"
                              >
                                {/* Tooltip on Hover */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col w-72 bg-[#0B1220] border border-border/40 rounded-2xl p-4 shadow-2xl z-50 pointer-events-auto text-xs space-y-3 font-sans">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-bold text-foreground text-sm">{project.name}</h4>
                                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{project.project_code || 'No Project Code'}</p>
                                    </div>
                                    <Badge
                                      className={`border-0 text-[10px] font-semibold uppercase ${
                                        project.priority === 'Critical'
                                          ? 'bg-destructive/15 text-destructive-foreground'
                                          : 'bg-primary/20 text-accent'
                                      }`}
                                    >
                                      {project.priority}
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground py-1 border-y border-border/10">
                                    <div>
                                      <span className="block text-[9px] font-bold uppercase text-slate-500">Client</span>
                                      <span className="text-foreground font-semibold">{project.client?.company_name || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="block text-[9px] font-bold uppercase text-slate-500">Budget</span>
                                      <span className="text-foreground font-semibold">
                                        {project.budget ? `${project.currency} ${project.budget.toLocaleString()}` : 'N/A'}
                                      </span>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="block text-[9px] font-bold uppercase text-slate-500">Scheduled Dates</span>
                                      <span className="text-foreground font-semibold flex items-center gap-1 mt-0.5">
                                        <Calendar size={11} className="text-accent" />
                                        {formatDate(project.start_date)} – {formatDate(project.end_date)}
                                      </span>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-[11px] mb-1">
                                      <span className="font-semibold text-muted-foreground">Progress</span>
                                      <span className="font-bold text-foreground">{project.progress}%</span>
                                    </div>
                                    <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                                      <div
                                        className="bg-accent h-full rounded-full"
                                        style={{ width: `${project.progress}%` }}
                                      />
                                    </div>
                                  </div>

                                  {project.milestones && project.milestones.length > 0 && (
                                    <div className="space-y-1">
                                      <span className="block text-[9px] font-bold uppercase text-slate-500">Milestones ({project.milestones.length})</span>
                                      <div className="max-h-20 overflow-y-auto space-y-1 pr-1">
                                        {project.milestones.slice(0, 3).map((m: any) => (
                                          <div key={m.id} className="flex justify-between items-center text-[10px] bg-background/30 p-1 rounded border border-border/10">
                                            <span className="truncate max-w-[120px] text-foreground font-medium">{m.name}</span>
                                            <span className={m.status === 'Completed' ? 'text-emerald-400 font-bold' : 'text-emerald-400 font-bold'}>{m.status}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex gap-2 pt-2 border-t border-border/10 text-[10px] font-bold">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditProject(project);
                                      }}
                                      className="flex-1 py-1 rounded bg-accent/15 text-accent hover:bg-accent/35 text-center"
                                    >
                                      Edit Project
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMilestonesProject(project);
                                        resetMilestone();
                                      }}
                                      className="flex-1 py-1 rounded bg-primary/20 text-accent hover:bg-primary/30 text-center"
                                    >
                                      Milestones
                                    </button>
                                  </div>
                                </div>

                                {/* Custom Colored Bar Wrapper with Progress Fill Overlay */}
                                <div className={`w-full h-full rounded-xl border relative flex items-center px-3 overflow-hidden ${statusColorClasses}`}>
                                  {/* Progress Overlay bar */}
                                  <div
                                    className={`absolute left-0 top-0 bottom-0 ${fillAccentClass} pointer-events-none transition-all`}
                                    style={{ width: `${project.progress}%` }}
                                  />
                                  {/* Display project info */}
                                  <div className="relative z-10 flex items-center justify-between w-full text-[10px] font-bold truncate gap-2 pointer-events-none">
                                    <span className="truncate">{project.name}</span>
                                    <span className="shrink-0 opacity-95">{project.progress}%</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* Handle Project without Start/End dates */
                              <div className="absolute left-4 right-4 h-9 rounded-xl border border-dashed border-amber-500/20 bg-amber-500/5 flex items-center justify-between px-3 text-xs">
                                <span className="text-amber-500/80 font-semibold flex items-center gap-1.5">
                                  <AlertCircle size={14} />
                                  Timeline schedule is not configured
                                </span>
                                <button
                                  onClick={() => handleOpenEditProject(project)}
                                  className="text-[10px] font-bold bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 px-2 py-1 rounded border border-amber-500/20 transition-all"
                                >
                                  Configure Schedule
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Project Creation/Modification Modal */}
            <AnimatePresence>
              {(isProjectOpen || editingProject) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl rounded-2xl border border-border/40 bg-card/90 p-6 backdrop-blur-md space-y-6 my-8"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {editingProject ? 'Modify Project Attributes' : 'Create Project Workflow'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Configure milestones timelines, client associations, and hourly parameters.
                      </p>
                    </div>

                    <form onSubmit={handleProjectSubmit(onProjectFormSubmit)} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Project Name</label>
                          <input
                            type="text"
                            required
                            {...registerProject('name')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Project Code</label>
                          <input
                            type="text"
                            {...registerProject('project_code')}
                            placeholder="e.g. PRJ-X"
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Client Partner</label>
                          <select
                            required
                            {...registerProject('client_id')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          >
                            {clients.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.company_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Status</label>
                          <select
                            {...registerProject('status')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          >
                            <option value="Planning">Planning</option>
                            <option value="Active">Active</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Priority</label>
                          <select
                            {...registerProject('priority')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Budget Allocation</label>
                          <input
                            type="number"
                            {...registerProject('budget')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Project Manager</label>
                          <select
                            {...registerProject('project_manager_id')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          >
                            <option value="">None Assigned</option>
                            {employees.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Start Date</label>
                          <input
                            type="date"
                            {...registerProject('start_date')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">End Date (Deadline)</label>
                          <input
                            type="date"
                            {...registerProject('end_date')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Estimated Hours</label>
                          <input
                            type="number"
                            {...registerProject('estimated_hours')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Actual Hours</label>
                          <input
                            type="number"
                            {...registerProject('actual_hours')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Progress (%)</label>
                          <input
                            type="number"
                            {...registerProject('progress')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Description Details</label>
                        <textarea
                          rows={3}
                          {...registerProject('description')}
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-4 border-t border-border/20">
                        <button
                          type="submit"
                          disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                          className="flex justify-center items-center gap-2 rounded-xl bg-primary/20 px-6 py-2.5 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50"
                        >
                          {(createProjectMutation.isPending || updateProjectMutation.isPending) && (
                            <Loader2 size={16} className="animate-spin" />
                          )}
                          <span>{editingProject ? 'Sync Details' : 'Create Project'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsProjectOpen(false)
                            setEditingProject(null)
                          }}
                          className="rounded-xl border border-border/40 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* Members Manager Modal */}
              {activeMembersProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl rounded-2xl border border-border/40 bg-card/90 p-6 backdrop-blur-md space-y-6 my-8"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {activeMembersProject.name} Team Members
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Assign employees and configure project roles.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveMembersProject(null)}
                        className="rounded-xl border border-border/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Members List */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground">Team Directory</h4>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto rounded-xl border border-border/20 p-3 bg-background/25">
                          {activeMembersProject.members && activeMembersProject.members.length > 0 ? (
                            activeMembersProject.members.map((member: any) => (
                              <div
                                key={member.id}
                                className="flex justify-between items-center rounded-xl border border-border/30 bg-card/45 p-3 hover:bg-card/65 transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-accent">
                                    {member.user.first_name[0] || ''}{member.user.last_name[0] || ''}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-foreground">
                                      {member.user.first_name} {member.user.last_name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">{member.role || 'Contributor'}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic block text-center py-8">
                              No employees assigned.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add Member Form */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground">Assign Employee</h4>
                        <form onSubmit={handleAddMember} className="space-y-3 p-4 rounded-xl border border-border/20 bg-background/25">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground">Select Employee</label>
                            <select
                              required
                              value={memberUserId}
                              onChange={(e) => setMemberUserId(e.target.value)}
                              className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                            >
                              <option value="">Select...</option>
                              {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.first_name} {emp.last_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground">Project Role</label>
                            <input
                              type="text"
                              value={memberRole}
                              onChange={(e) => setMemberRole(e.target.value)}
                              placeholder="e.g. Lead Designer"
                              className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={addMemberMutation.isPending}
                            className="w-full flex justify-center items-center gap-2 rounded-xl bg-primary/20 py-2 text-xs font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50 mt-4"
                          >
                            {addMemberMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                            <span>Confirm Assign</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Milestones Manager Modal */}
              {activeMilestonesProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl rounded-2xl border border-border/40 bg-card/90 p-6 backdrop-blur-md space-y-6 my-8"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {activeMilestonesProject.name} Milestones
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Define chronological targets, due dates, and tracking status.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveMilestonesProject(null)}
                        className="rounded-xl border border-border/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Milestones Directory */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground">Milestones List</h4>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto rounded-xl border border-border/20 p-3 bg-background/25">
                          {activeMilestonesProject.milestones && activeMilestonesProject.milestones.length > 0 ? (
                            activeMilestonesProject.milestones.map((milestone: any) => (
                              <div
                                key={milestone.id}
                                className="flex justify-between items-center rounded-xl border border-border/30 bg-card/45 p-3 hover:bg-card/65 transition-colors"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleMilestone(milestone)}
                                      className={`rounded-full h-4 w-4 border border-accent flex items-center justify-center transition-colors ${
                                        milestone.status === 'Completed' ? 'bg-accent text-background' : ''
                                      }`}
                                    >
                                      {milestone.status === 'Completed' && <Check size={10} />}
                                    </button>
                                    <span
                                      className={`text-xs font-bold text-foreground ${
                                        milestone.status === 'Completed' ? 'line-through opacity-60' : ''
                                      }`}
                                    >
                                      {milestone.name}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground">{milestone.description || 'No description'}</p>
                                  {milestone.due_date && (
                                    <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                      <Calendar size={10} />
                                      <span>Due: {milestone.due_date}</span>
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMilestone(milestone.id, milestone.name)}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic block text-center py-8">
                              No project targets registered.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add Milestone Form */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground">Register Target</h4>
                        <form onSubmit={handleMilestoneSubmit(handleMilestoneFormSubmit)} className="space-y-3 p-4 rounded-xl border border-border/20 bg-background/25">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground">Milestone Name</label>
                            <input
                              type="text"
                              required
                              {...registerMilestone('name')}
                              placeholder="e.g. Design Handover"
                              className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground">Description</label>
                            <textarea
                              rows={2}
                              {...registerMilestone('description')}
                              className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground">Due Date</label>
                            <input
                              type="date"
                              {...registerMilestone('due_date')}
                              className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={createMilestoneMutation.isPending}
                            className="w-full flex justify-center items-center gap-2 rounded-xl bg-primary/20 py-2 text-xs font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50 mt-4"
                          >
                            {createMilestoneMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                            <span>Add Milestone</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </AppLayout>
  )
}
