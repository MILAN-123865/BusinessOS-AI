'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCreateTaskComment,
  useDeleteTaskComment,
  useCreateTaskSubtask,
  useUpdateTaskSubtask,
  useDeleteTaskSubtask,
} from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { useEmployees } from '@/hooks/useEmployees'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ListTodo,
  Plus,
  Trash2,
  Edit2,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  Grid,
  List as ListIcon,
  MessageSquare,
  Paperclip,
  CheckSquare,
  ArrowRight,
  User,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  task_code: z.string().max(100).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  project_id: z.string().min(1, 'Project is required'),
  assignee_id: z.string().optional().or(z.literal('')),
  status: z.string().default('Todo'),
  priority: z.string().default('Medium'),
  estimated_hours: z.preprocess((val) => Number(val) || 0, z.number().min(0)),
  actual_hours: z.preprocess((val) => Number(val) || 0, z.number().min(0)),
  progress: z.preprocess((val) => Number(val) || 0, z.number().min(0).max(100)),
  start_date: z.string().optional().or(z.literal('')),
  due_date: z.string().optional().or(z.literal('')),
})

type TaskFormValues = z.infer<typeof taskSchema>

const KANBAN_STATUSES = ['Todo', 'In Progress', 'Review', 'Testing', 'Completed']

export default function TasksPage() {
  const user = useAuthStore((state) => state.user)

  // React Query Hooks
  const { data: tasks = [], isLoading: tasksLoading, isError: tasksError } = useTasks()
  const { data: projects = [] } = useProjects()
  const { data: employees = [] } = useEmployees()

  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

  const createCommentMutation = useCreateTaskComment()
  const deleteCommentMutation = useDeleteTaskComment()

  const createSubtaskMutation = useCreateTaskSubtask()
  const updateSubtaskMutation = useUpdateTaskSubtask()
  const deleteSubtaskMutation = useDeleteTaskSubtask()

  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Layout View Switch (Kanban vs List)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('All')
  const [selectedPriority, setSelectedPriority] = useState('All')

  // Modals / Drawer active states
  const [isTaskOpen, setIsTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any | null>(null)
  const [activeTaskDetails, setActiveTaskDetails] = useState<any | null>(null)

  // Comment & Subtask inline forms input
  const [commentContent, setCommentContent] = useState('')
  const [subtaskTitle, setSubtaskTitle] = useState('')

  // Task Form Configuration
  const {
    register: registerTask,
    handleSubmit: handleTaskSubmit,
    reset: resetTask,
    formState: { errors: taskErrors },
  } = useForm<any>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      task_code: '',
      description: '',
      project_id: '',
      assignee_id: '',
      status: 'Todo',
      priority: 'Medium',
      estimated_hours: 0,
      actual_hours: 0,
      progress: 0,
      start_date: '',
      due_date: '',
    },
  })

  const onTaskFormSubmit = async (data: TaskFormValues) => {
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      const payload = {
        ...data,
        start_date: data.start_date || undefined,
        due_date: data.due_date || undefined,
        assignee_id: data.assignee_id || undefined,
      }

      if (editingTask) {
        await updateTaskMutation.mutateAsync({
          id: editingTask.id,
          payload,
        })
        setSuccessMsg(`Task '${data.title}' updated successfully.`)
        setEditingTask(null)
      } else {
        await createTaskMutation.mutateAsync({
          ...payload,
          organization_id: user?.organization_id || '',
        })
        setSuccessMsg(`Task '${data.title}' created successfully.`)
        setIsTaskOpen(false)
      }
      resetTask()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Task save failed.')
    }
  }

  const handleDeleteTask = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete task '${title}'?`)) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await deleteTaskMutation.mutateAsync(id)
      setSuccessMsg(`Task '${title}' deleted successfully.`)
      if (activeTaskDetails?.id === id) setActiveTaskDetails(null)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Task deletion failed.')
    }
  }

  const handleOpenEditTask = (task: any) => {
    setEditingTask(task)
    setIsTaskOpen(false)
    resetTask({
      title: task.title,
      task_code: task.task_code || '',
      description: task.description || '',
      project_id: task.project_id,
      assignee_id: task.assignee_id || '',
      status: task.status,
      priority: task.priority,
      estimated_hours: task.estimated_hours,
      actual_hours: task.actual_hours,
      progress: task.progress,
      start_date: task.start_date || '',
      due_date: task.due_date || '',
    })
  }

  // Quick Kanban Move
  const handleMoveStatus = async (taskId: string, nextStatus: string) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        payload: { status: nextStatus },
      })
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Status update failed.')
    }
  }

  // Nested Comments handler
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTaskDetails || !commentContent) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await createCommentMutation.mutateAsync({
        taskId: activeTaskDetails.id,
        payload: { content: commentContent },
      })
      setCommentContent('')
      
      const updated = tasks.find((t) => t.id === activeTaskDetails.id)
      if (updated) setActiveTaskDetails(updated)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Comment save failed.')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!activeTaskDetails) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await deleteCommentMutation.mutateAsync({
        taskId: activeTaskDetails.id,
        commentId,
      })
      
      const updated = tasks.find((t) => t.id === activeTaskDetails.id)
      if (updated) setActiveTaskDetails(updated)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Comment deletion failed.')
    }
  }

  // Nested Subtask Checklist handlers
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTaskDetails || !subtaskTitle) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await createSubtaskMutation.mutateAsync({
        taskId: activeTaskDetails.id,
        payload: { title: subtaskTitle, is_completed: false },
      })
      setSubtaskTitle('')
      
      const updated = tasks.find((t) => t.id === activeTaskDetails.id)
      if (updated) setActiveTaskDetails(updated)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Subtask save failed.')
    }
  }

  const handleToggleSubtask = async (subtask: any) => {
    if (!activeTaskDetails) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await updateSubtaskMutation.mutateAsync({
        taskId: activeTaskDetails.id,
        subtaskId: subtask.id,
        payload: { is_completed: !subtask.is_completed },
      })
      
      const updated = tasks.find((t) => t.id === activeTaskDetails.id)
      if (updated) setActiveTaskDetails(updated)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Subtask status update failed.')
    }
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!activeTaskDetails) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await deleteSubtaskMutation.mutateAsync({
        taskId: activeTaskDetails.id,
        subtaskId,
      })
      
      const updated = tasks.find((t) => t.id === activeTaskDetails.id)
      if (updated) setActiveTaskDetails(updated)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Subtask deletion failed.')
    }
  }

  // Filters application
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.task_code || '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesProject = selectedProjectId === 'All' || t.project_id === selectedProjectId
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority

    return matchesSearch && matchesProject && matchesPriority
  })

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Tasks & Board</h1>
            <p className="mt-2 text-muted-foreground">Manage user stories, sprints timelines, and Kanban board columns.</p>
          </div>
          {!tasksLoading && !tasksError && (
            <div className="flex gap-3">
              <div className="flex bg-card/40 rounded-xl border border-border/40 p-0.5 shrink-0">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`rounded-lg p-1.5 transition-all ${
                    viewMode === 'kanban' ? 'bg-primary/20 text-accent font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-lg p-1.5 transition-all ${
                    viewMode === 'list' ? 'bg-primary/20 text-accent font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  <ListIcon size={18} />
                </button>
              </div>
              <button
                onClick={() => {
                  setIsTaskOpen(true)
                  setEditingTask(null)
                  resetTask({
                    title: '',
                    task_code: '',
                    description: '',
                    project_id: projects[0]?.id || '',
                    assignee_id: '',
                    status: 'Todo',
                    priority: 'Medium',
                    estimated_hours: 0,
                    actual_hours: 0,
                    progress: 0,
                    start_date: '',
                    due_date: '',
                  })
                }}
                className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all self-start"
              >
                <Plus size={16} />
                <span>Create Task</span>
              </button>
            </div>
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

        {tasksLoading ? (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-card/40 border border-border/40" />
              ))}
            </div>
            <div className="h-96 rounded-xl bg-card/40 animate-pulse border border-border/40" />
          </div>
        ) : tasksError ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle size={48} className="text-destructive animate-bounce" />
            <h3 className="text-xl font-bold text-foreground">API Connection Error</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Failed to query task manager microservices. Verify reload server status.
            </p>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid gap-6 sm:grid-cols-3">
              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Backlog & Tasks</p>
                    <p className="text-3xl font-bold">{tasks.length}</p>
                  </div>
                  <div className="rounded-lg bg-primary/20 p-3">
                    <ListTodo size={24} className="text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-3xl font-bold">
                      {tasks.filter((t) => t.status === 'In Progress').length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/20 p-3">
                    <Clock size={24} className="text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                    <p className="text-3xl font-bold">
                      {tasks.filter((t) => t.status === 'Completed').length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/20 p-3">
                    <CheckSquare size={24} className="text-accent" />
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
                  placeholder="Search tasks by title or internal code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border/40 bg-background/50 py-2 pl-10 pr-4 text-sm text-foreground outline-none focus:border-accent"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                >
                  <option value="All">All Projects</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
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

            {/* Main view panel rendering */}
            {viewMode === 'kanban' ? (
              /* Kanban Columns View */
              <div className="grid gap-6 sm:grid-cols-5 overflow-x-auto pb-4">
                {KANBAN_STATUSES.map((statusName) => {
                  const columnTasks = filteredTasks.filter((t) => t.status === statusName)
                  return (
                    <div key={statusName} className="flex flex-col gap-4 min-w-[200px]">
                      <div className="flex items-center justify-between border-b border-border/20 pb-2">
                        <span className="text-xs font-bold uppercase text-muted-foreground">{statusName}</span>
                        <Badge className="bg-primary/20 text-accent text-[9px] border-0">
                          {columnTasks.length}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-3 min-h-[350px] rounded-xl border border-dashed border-border/20 p-2 bg-card/5">
                        {columnTasks.map((task) => {
                          const initials = task.assignee
                            ? `${task.assignee.first_name[0] || ''}${task.assignee.last_name[0] || ''}`
                            : 'N/A'

                          return (
                            <div
                              key={task.id}
                              className="group rounded-xl border border-border/30 bg-card/45 p-3 hover:border-accent/40 transition-all cursor-pointer space-y-3"
                              onClick={() => setActiveTaskDetails(task)}
                            >
                              <div className="space-y-1">
                                <span className="text-[9px] text-muted-foreground font-mono">{task.task_code}</span>
                                <h4 className="font-bold text-foreground text-xs leading-tight group-hover:text-accent transition-colors">
                                  {task.title}
                                </h4>
                              </div>

                              <div className="flex items-center justify-between">
                                <Badge
                                  className={`border-0 text-[8px] uppercase ${
                                    task.priority === 'Critical' || task.priority === 'High'
                                      ? 'bg-destructive/15 text-destructive-foreground'
                                      : 'bg-primary/20 text-accent'
                                  }`}
                                >
                                  {task.priority}
                                </Badge>

                                <div className="flex items-center gap-1">
                                  {task.assignee ? (
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[8px] font-bold text-accent">
                                      {initials}
                                    </div>
                                  ) : (
                                    <User size={10} className="text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* DataTable List View */
              <div className="overflow-x-auto rounded-2xl border border-border/40 bg-card/20 backdrop-blur-md">
                <table className="w-full border-collapse text-left text-sm text-foreground">
                  <thead className="bg-card/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border/40">
                    <tr>
                      <th className="px-6 py-4">Task</th>
                      <th className="px-6 py-4">Project</th>
                      <th className="px-6 py-4">Assignee</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {filteredTasks.map((task) => {
                      const assigneeInitials = task.assignee
                        ? `${task.assignee.first_name[0] || ''}${task.assignee.last_name[0] || ''}`
                        : 'N/A'

                      return (
                        <tr key={task.id} className="hover:bg-card/15 transition-all">
                          <td className="px-6 py-4">
                            <div className="cursor-pointer" onClick={() => setActiveTaskDetails(task)}>
                              <p className="font-bold text-foreground hover:text-accent transition-colors">{task.title}</p>
                              {task.task_code && (
                                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{task.task_code}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {task.project ? (
                              <Badge variant="outline" className="border-border/40 capitalize text-xs">
                                {task.project.name}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {task.assignee ? (
                              <div className="flex items-center gap-1.5">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-accent">
                                  {assigneeInitials}
                                </div>
                                <span className="text-xs text-foreground">
                                  {task.assignee.first_name} {task.assignee.last_name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              className={`border-0 text-xs font-semibold uppercase ${
                                task.priority === 'Critical'
                                  ? 'bg-destructive/15 text-destructive-foreground'
                                  : 'bg-primary/20 text-accent'
                              }`}
                            >
                              {task.priority}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={task.status}
                              onChange={(e) => handleMoveStatus(task.id, e.target.value)}
                              className="rounded-xl border border-border/40 bg-background/50 px-2.5 py-1 text-xs text-foreground outline-none focus:border-accent"
                            >
                              {KANBAN_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground">
                            {task.due_date ? (
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {task.due_date}
                              </span>
                            ) : (
                              <span className="italic">No Deadline</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-3 text-xs font-semibold">
                              <button
                                onClick={() => handleOpenEditTask(task)}
                                className="text-accent hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id, task.title)}
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
            )}

            {/* Task Creation / Edit Dialogue */}
            <AnimatePresence>
              {(isTaskOpen || editingTask) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl rounded-2xl border border-border/40 bg-card/90 p-6 backdrop-blur-md space-y-6 my-8"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {editingTask ? 'Modify Task Details' : 'Create Project Task'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Map assignee, configure estimated hours, and specify start/due deadlines.
                      </p>
                    </div>

                    <form onSubmit={handleTaskSubmit(onTaskFormSubmit)} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Task Title</label>
                          <input
                            type="text"
                            required
                            {...registerTask('title')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Task Code</label>
                          <input
                            type="text"
                            {...registerTask('task_code')}
                            placeholder="e.g. TSK-101"
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Project Scope</label>
                          <select
                            required
                            {...registerTask('project_id')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          >
                            {projects.map((proj) => (
                              <option key={proj.id} value={proj.id}>
                                {proj.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Status</label>
                          <select
                            {...registerTask('status')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          >
                            {KANBAN_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Priority</label>
                          <select
                            {...registerTask('priority')}
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
                          <label className="text-xs font-semibold text-muted-foreground">Assignee Employee</label>
                          <select
                            {...registerTask('assignee_id')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          >
                            <option value="">Unassigned</option>
                            {employees.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Estimated Hours</label>
                          <input
                            type="number"
                            {...registerTask('estimated_hours')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Start Date</label>
                          <input
                            type="date"
                            {...registerTask('start_date')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Due Date (Deadline)</label>
                          <input
                            type="date"
                            {...registerTask('due_date')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Task Description</label>
                        <textarea
                          rows={3}
                          {...registerTask('description')}
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-4 border-t border-border/20">
                        <button
                          type="submit"
                          disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                          className="flex justify-center items-center gap-2 rounded-xl bg-primary/20 px-6 py-2.5 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50"
                        >
                          {(createTaskMutation.isPending || updateTaskMutation.isPending) && (
                            <Loader2 size={16} className="animate-spin" />
                          )}
                          <span>{editingTask ? 'Sync Details' : 'Create Task'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsTaskOpen(false)
                            setEditingTask(null)
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

              {/* Task Details Drawer & Comments/Checklist Panel */}
              {activeTaskDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-0">
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="w-full max-w-xl h-screen bg-card border-l border-border/40 p-6 flex flex-col justify-between overflow-y-auto space-y-6"
                  >
                    <div className="space-y-6">
                      {/* Top Header */}
                      <div className="flex justify-between items-start border-b border-border/20 pb-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground font-mono">{activeTaskDetails.task_code}</span>
                          <h3 className="text-xl font-bold text-foreground leading-tight">
                            {activeTaskDetails.title}
                          </h3>
                        </div>
                        <button
                          onClick={() => setActiveTaskDetails(null)}
                          className="rounded-xl border border-border/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Close
                        </button>
                      </div>

                      {/* Info grid */}
                      <div className="grid gap-4 sm:grid-cols-2 rounded-xl bg-background/25 border border-border/20 p-4 text-xs">
                        <div className="space-y-2">
                          <p className="text-muted-foreground font-semibold">Project Associated:</p>
                          <p className="text-foreground font-bold">{activeTaskDetails.project?.name || 'Unassigned'}</p>
                          <p className="text-muted-foreground font-semibold mt-2">Due Date:</p>
                          <p className="text-foreground font-bold">{activeTaskDetails.due_date || 'No deadline set'}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-muted-foreground font-semibold">Assignee Point:</p>
                          <p className="text-foreground font-bold">
                            {activeTaskDetails.assignee
                              ? `${activeTaskDetails.assignee.first_name} ${activeTaskDetails.assignee.last_name}`
                              : 'Unassigned'}
                          </p>
                          <p className="text-muted-foreground font-semibold mt-2">Task Priority:</p>
                          <Badge className="bg-primary/20 text-accent border-0 mt-0.5">
                            {activeTaskDetails.priority}
                          </Badge>
                        </div>
                      </div>

                      {/* Subtasks Checklist */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                          <CheckSquare size={14} className="text-accent" />
                          <span>Subtask Checklist ({activeTaskDetails.subtasks?.length || 0})</span>
                        </h4>
                        
                        {/* Subtasks List */}
                        <div className="space-y-2 max-h-[160px] overflow-y-auto rounded-xl border border-border/20 p-3 bg-background/25">
                          {activeTaskDetails.subtasks && activeTaskDetails.subtasks.length > 0 ? (
                            activeTaskDetails.subtasks.map((sub: any) => (
                              <div key={sub.id} className="flex justify-between items-center py-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={sub.is_completed}
                                    onChange={() => handleToggleSubtask(sub)}
                                    className="rounded border-border/40 text-accent focus:ring-accent"
                                  />
                                  <span className={`text-xs ${sub.is_completed ? 'line-through opacity-60' : ''}`}>
                                    {sub.title}
                                  </span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSubtask(sub.id)}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic block text-center py-4">No checklist items.</span>
                          )}
                        </div>

                        {/* Add subtask Form */}
                        <form onSubmit={handleAddSubtask} className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Add new checklist item..."
                            value={subtaskTitle}
                            onChange={(e) => setSubtaskTitle(e.target.value)}
                            className="flex-1 rounded-xl border border-border/40 bg-background/50 px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                          />
                          <button
                            type="submit"
                            className="rounded-xl border border-border/40 px-3 py-1.5 text-xs text-accent hover:bg-card/40 transition-colors"
                          >
                            Add
                          </button>
                        </form>
                      </div>

                      {/* Threaded Comments */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                          <MessageSquare size={14} className="text-accent" />
                          <span>Comments & Notes</span>
                        </h4>

                        {/* Comments Thread */}
                        <div className="space-y-3 max-h-[180px] overflow-y-auto rounded-xl border border-border/20 p-3 bg-background/25">
                          {activeTaskDetails.comments && activeTaskDetails.comments.length > 0 ? (
                            activeTaskDetails.comments.map((comment: any) => {
                              const authorInitials = `${comment.user.first_name[0] || ''}${comment.user.last_name[0] || ''}`
                              return (
                                <div key={comment.id} className="flex gap-2.5 items-start">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-accent shrink-0 mt-0.5">
                                    {authorInitials}
                                  </div>
                                  <div className="flex-1 bg-card/60 rounded-xl p-2.5 border border-border/25">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-[10px] font-bold text-foreground">
                                        {comment.user.first_name} {comment.user.last_name}
                                      </span>
                                      {comment.user_id === user?.id && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteComment(comment.id)}
                                          className="text-[9px] text-muted-foreground hover:text-destructive"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {comment.content}
                                    </p>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <span className="text-xs text-muted-foreground italic block text-center py-4">No team notes yet.</span>
                          )}
                        </div>

                        {/* Add Comment Form */}
                        <form onSubmit={handleAddComment} className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Add task update comment..."
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            className="flex-1 rounded-xl border border-border/40 bg-background/50 px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                          />
                          <button
                            type="submit"
                            className="rounded-xl border border-border/40 px-3 py-1.5 text-xs text-accent hover:bg-card/40 transition-colors"
                          >
                            Send
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
    </>
  )
}
