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
  TrendingUp,
  Trash,
  UserPlus,
  Check,
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
            <div className="grid gap-6 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
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
            <div className="grid gap-6 sm:grid-cols-3">
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
              <div className="flex gap-3">
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

            {/* Projects DataTable */}
            <div className="overflow-x-auto rounded-2xl border border-border/40 bg-card/20 backdrop-blur-md">
              <table className="w-full border-collapse text-left text-sm text-foreground">
                <thead className="bg-card/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border/40">
                  <tr>
                    <th className="px-6 py-4">Project</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Progress</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Budget</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {filteredProjects.map((project) => {
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
