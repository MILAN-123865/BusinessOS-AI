'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useUpdateEmployeeRoles,
  useUpdateEmployeeDepartment,
  useUpdateEmployeeStatus,
  useInviteEmployee,
  useBulkImportEmployees,
} from '@/hooks/useEmployees'
import { useOrganizationDepartments } from '@/hooks/useDepartments'
import { useRoles } from '@/hooks/useRoles'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  UserPlus,
  Trash2,
  Shield,
  Briefcase,
  Building,
  Upload,
  Download,
  Search,
  Filter,
  Loader2,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Check,
  UserCheck,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const employeeSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  phone_number: z.string().max(20).optional().or(z.literal('')),
  password: z.string().min(8, 'Password must contain at least 8 characters'),
  department_id: z.string().optional().or(z.literal('')),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

export default function EmployeesPage() {
  const user = useAuthStore((state) => state.user)

  // Fetch employees, departments, and roles
  const { data: employees = [], isLoading: employeesLoading, isError: employeesError } = useEmployees()
  const { data: departments = [] } = useOrganizationDepartments(user?.organization_id || '')
  const { data: roles = [] } = useRoles()

  const createMutation = useCreateEmployee()
  const updateMutation = useUpdateEmployee()
  const deleteMutation = useDeleteEmployee()
  const updateRolesMutation = useUpdateEmployeeRoles()
  const updateDeptMutation = useUpdateEmployeeDepartment()
  const updateStatusMutation = useUpdateEmployeeStatus()
  const inviteMutation = useInviteEmployee()
  const bulkImportMutation = useBulkImportEmployees()

  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDeptId, setSelectedDeptId] = useState('All')
  const [selectedRoleId, setSelectedRoleId] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  // Dialog Modals States
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  
  // Quick Assignment states
  const [targetEmployee, setTargetEmployee] = useState<any | null>(null)
  const [activeModal, setActiveModal] = useState<'roles' | 'department' | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [transferDeptId, setTransferDeptId] = useState('')

  // Form Specification
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      password: '',
      department_id: '',
    },
  })

  // Zod invitation handler
  const onInviteSubmit = async (data: EmployeeFormValues) => {
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await inviteMutation.mutateAsync({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number || undefined,
        password: data.password,
        organization_id: user?.organization_id,
        department_id: data.department_id || undefined,
      })
      setSuccessMsg(`Invitation dispatched to ${data.email} successfully.`)
      reset()
      setIsInviteOpen(false)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to dispatch invitation.')
    }
  }

  // Quick Action triggers
  const handleToggleStatus = async (empId: string, currentActive: boolean) => {
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await updateStatusMutation.mutateAsync({ id: empId, isActive: !currentActive })
      setSuccessMsg('Employee active status toggled successfully.')
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Status toggle failed.')
    }
  }

  const handleTransferDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetEmployee) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await updateDeptMutation.mutateAsync({
        id: targetEmployee.id,
        departmentId: transferDeptId || null,
      })
      setSuccessMsg(`Transferred ${targetEmployee.first_name} successfully.`)
      setTargetEmployee(null)
      setActiveModal(null)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Department transfer failed.')
    }
  }

  const handleRolesSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetEmployee) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await updateRolesMutation.mutateAsync({
        id: targetEmployee.id,
        roleIds: selectedRoleIds,
      })
      setSuccessMsg(`Roles sync completed for ${targetEmployee.first_name}.`)
      setTargetEmployee(null)
      setActiveModal(null)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Roles sync failed.')
    }
  }

  const handleDeleteEmployee = async (empId: string, name: string) => {
    if (empId === user?.id) {
      alert('Cannot delete your own logged-in user profile.')
      return
    }
    if (!confirm(`Are you sure you want to soft-delete employee '${name}'?`)) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await deleteMutation.mutateAsync(empId)
      setSuccessMsg(`Employee '${name}' removed successfully.`)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Delete failed.')
    }
  }

  // Bulk Import handler
  const [csvText, setCsvText] = useState('')
  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvText) return
    setSuccessMsg(null)
    setErrorMsg(null)
    
    // Parse CSV simple parser
    const lines = csvText.split('\n')
    const payloads: any[] = []
    lines.forEach((line) => {
      const parts = line.split(',')
      if (parts.length >= 4) {
        payloads.push({
          email: parts[0].trim(),
          first_name: parts[1].trim(),
          last_name: parts[2].trim(),
          password: parts[3].trim(),
          organization_id: user?.organization_id,
        })
      }
    })

    if (payloads.length === 0) {
      setErrorMsg('No valid comma-separated rows detected.')
      return
    }

    try {
      await bulkImportMutation.mutateAsync(payloads)
      setSuccessMsg(`Successfully imported ${payloads.length} employee records.`)
      setCsvText('')
      setIsBulkOpen(false)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Bulk import failed.')
    }
  }

  // CSV Mock exporter
  const handleExport = () => {
    const headers = 'ID,Email,First Name,Last Name,ActiveStatus\n'
    const rows = employees
      .map((e) => `${e.id},${e.email},${e.first_name},${e.last_name},${e.is_active}`)
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `BusinessOS_Employees_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  // Frontend directory filters
  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.phone_number || '').includes(searchQuery)

    const matchesDept = selectedDeptId === 'All' || emp.department_id === selectedDeptId
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Active' && emp.is_active) ||
      (selectedStatus === 'Inactive' && !emp.is_active)

    return matchesSearch && matchesDept && matchesStatus
  })

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Employee Directory</h1>
            <p className="mt-2 text-muted-foreground">Manage user accounts, assign roles, and handle department transfers.</p>
          </div>
          {!employeesLoading && !employeesError && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/40 px-4 py-2.5 text-sm text-foreground hover:bg-card/60 transition-all"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
              <button
                onClick={() => setIsBulkOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/40 px-4 py-2.5 text-sm text-foreground hover:bg-card/60 transition-all"
              >
                <Upload size={16} />
                <span>Bulk Import</span>
              </button>
              <button
                onClick={() => setIsInviteOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all"
              >
                <UserPlus size={16} />
                <span>Invite Employee</span>
              </button>
            </div>
          )}
        </div>

        {/* Status Messages */}
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

        {employeesLoading ? (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-card/40 animate-pulse border border-border/40" />
              ))}
            </div>
            <div className="h-96 rounded-xl bg-card/40 animate-pulse border border-border/40" />
          </div>
        ) : employeesError ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle size={48} className="text-destructive animate-bounce" />
            <h3 className="text-xl font-bold text-foreground">API Connection Error</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Failed to query employee directory microservices. Ensure backend active state.
            </p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid gap-6 sm:grid-cols-3">
              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Team Size</p>
                    <p className="text-3xl font-bold">{employees.length}</p>
                  </div>
                  <div className="rounded-lg bg-primary/20 p-3">
                    <Users size={24} className="text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                    <p className="text-3xl font-bold">
                      {employees.filter((e) => e.is_active).length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/20 p-3">
                    <UserCheck size={24} className="text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Assigned Departments</p>
                    <p className="text-3xl font-bold">{departments.length}</p>
                  </div>
                  <div className="rounded-lg bg-primary/20 p-3">
                    <Building size={24} className="text-accent" />
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
                  placeholder="Search employees by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border/40 bg-background/50 py-2 pl-10 pr-4 text-sm text-foreground outline-none focus:border-accent"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                >
                  <option value="All">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Directory Table */}
            <div className="overflow-x-auto rounded-2xl border border-border/40 bg-card/20 backdrop-blur-md">
              <table className="w-full border-collapse text-left text-sm text-foreground">
                <thead className="bg-card/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border/40">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Roles</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {filteredEmployees.map((emp) => {
                    const empName = `${emp.first_name} ${emp.last_name}`
                    const initials = `${emp.first_name[0] || ''}${emp.last_name[0] || ''}`
                    
                    // Match department display
                    const dept = departments.find((d) => d.id === emp.department_id)

                    return (
                      <tr key={emp.id} className="hover:bg-card/15 transition-all">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/30 font-semibold text-accent">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{empName}</p>
                            {emp.is_superuser && (
                              <Badge className="bg-primary/20 text-accent border-0 text-[9px] mt-0.5">
                                Superuser
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail size={12} />
                            <span>{emp.email}</span>
                          </p>
                          {emp.phone_number && (
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                              <Phone size={12} />
                              <span>{emp.phone_number}</span>
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {dept ? (
                            <Badge className="bg-primary/10 text-accent border-0 capitalize">
                              {dept.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">None Assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {emp.roles && emp.roles.length > 0 ? (
                              emp.roles.map((r, idx) => (
                                <Badge key={idx} variant="outline" className="text-[10px] border-border/40">
                                  {r}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No Roles</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(emp.id, emp.is_active)}
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold border-0 transition-all ${
                              emp.is_active
                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-destructive/10 text-destructive-foreground hover:bg-destructive/20'
                            }`}
                          >
                            {emp.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3 text-xs font-semibold">
                            <button
                              onClick={() => {
                                setTargetEmployee(emp)
                                setTransferDeptId(emp.department_id || '')
                                setActiveModal('department')
                              }}
                              className="text-accent hover:underline"
                            >
                              Transfer
                            </button>
                            <button
                              onClick={() => {
                                setTargetEmployee(emp)
                                setSelectedRoleIds(emp.roles || [])
                                setActiveModal('roles')
                              }}
                              className="text-accent hover:underline"
                            >
                              Roles
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp.id, empName)}
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

            {/* Quick Modals Accompany */}
            <AnimatePresence>
              {/* Invite Employee Modal */}
              {isInviteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md rounded-2xl border border-border/40 bg-card/90 p-6 backdrop-blur-md space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Invite New Employee</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Send access invitations and map operational departments.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit(onInviteSubmit)} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">First Name</label>
                          <input
                            type="text"
                            required
                            {...register('first_name')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                          {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Last Name</label>
                          <input
                            type="text"
                            required
                            {...register('last_name')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                          {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                        <input
                          type="email"
                          required
                          {...register('email')}
                          placeholder="name@company.com"
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Password (Temp)</label>
                        <input
                          type="password"
                          required
                          {...register('password')}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                        />
                        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Contact Phone</label>
                          <input
                            type="text"
                            {...register('phone_number')}
                            placeholder="+1 (555) 000-0000"
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Department</label>
                          <select
                            {...register('department_id')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          >
                            <option value="">Unassigned</option>
                            {departments.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-4 border-t border-border/20">
                        <button
                          type="submit"
                          disabled={inviteMutation.isPending}
                          className="flex justify-center items-center gap-2 rounded-xl bg-primary/20 px-6 py-2.5 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50"
                        >
                          {inviteMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                          <span>Dispatch Invite</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsInviteOpen(false)}
                          className="rounded-xl border border-border/40 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* Bulk Import Modal */}
              {isBulkOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-lg rounded-2xl border border-border/40 bg-card/90 p-6 backdrop-blur-md space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Bulk Import Employees</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Paste comma-separated rows matching the format template below.
                      </p>
                    </div>

                    <form onSubmit={handleBulkImport} className="space-y-4">
                      <div className="rounded-xl bg-background/50 p-3 border border-border/20 text-xs font-mono text-muted-foreground">
                        <p className="font-bold text-foreground">Template Row Format:</p>
                        <p>email,first_name,last_name,password</p>
                        <p className="mt-1 font-bold text-foreground">Example Row:</p>
                        <p>john.doe@company.com,John,Doe,SecurePass123!</p>
                      </div>

                      <div className="space-y-1">
                        <textarea
                          rows={6}
                          required
                          value={csvText}
                          onChange={(e) => setCsvText(e.target.value)}
                          placeholder="jane.smith@company.com,Jane,Smith,SecurePass456!&#10;bob.jones@company.com,Bob,Jones,SecurePass789!"
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent font-mono"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-4 border-t border-border/20">
                        <button
                          type="submit"
                          disabled={bulkImportMutation.isPending}
                          className="flex justify-center items-center gap-2 rounded-xl bg-primary/20 px-6 py-2.5 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50"
                        >
                          {bulkImportMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                          <span>Execute Import</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsBulkOpen(false)}
                          className="rounded-xl border border-border/40 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* Department Transfer Modal */}
              {activeModal === 'department' && targetEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-sm rounded-2xl border border-border/40 bg-card/90 p-6 backdrop-blur-md space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Transfer Department</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Select a new department branch for {targetEmployee.first_name} {targetEmployee.last_name}.
                      </p>
                    </div>

                    <form onSubmit={handleTransferDeptSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <select
                          value={transferDeptId}
                          onChange={(e) => setTransferDeptId(e.target.value)}
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                        >
                          <option value="">Unassigned</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2 justify-end pt-4 border-t border-border/20">
                        <button
                          type="submit"
                          disabled={updateDeptMutation.isPending}
                          className="flex justify-center items-center gap-2 rounded-xl bg-primary/20 px-6 py-2.5 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50"
                        >
                          {updateDeptMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                          <span>Confirm Transfer</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetEmployee(null)
                            setActiveModal(null)
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

              {/* Roles Sync Modal */}
              {activeModal === 'roles' && targetEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md rounded-2xl border border-border/40 bg-card/90 p-6 backdrop-blur-md space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Sync User Roles</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Configure roles granted to {targetEmployee.first_name} {targetEmployee.last_name}.
                      </p>
                    </div>

                    <form onSubmit={handleRolesSyncSubmit} className="space-y-4">
                      <div className="max-h-[250px] overflow-y-auto rounded-xl border border-border/40 bg-background/30 p-3 space-y-2">
                        {roles.map((role) => {
                          const isChecked = selectedRoleIds.includes(role.name) || selectedRoleIds.includes(role.id)
                          return (
                            <label key={role.id} className="flex items-center gap-2.5 cursor-pointer select-none py-1">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  // Sync both Name and ID representation depending on API structure
                                  const searchVal = role.id // Seed maps typically expect Role UUIDs
                                  setSelectedRoleIds((prev) =>
                                    prev.includes(searchVal)
                                      ? prev.filter((id) => id !== searchVal)
                                      : [...prev, searchVal]
                                  )
                                }}
                                className="rounded border-border/40 text-accent focus:ring-accent"
                              />
                              <div className="text-xs">
                                <span className="font-bold text-foreground">{role.name}</span>
                                {role.description && (
                                  <p className="text-[10px] text-muted-foreground">{role.description}</p>
                                )}
                              </div>
                            </label>
                          )
                        })}
                      </div>

                      <div className="flex gap-2 justify-end pt-4 border-t border-border/20">
                        <button
                          type="submit"
                          disabled={updateRolesMutation.isPending}
                          className="flex justify-center items-center gap-2 rounded-xl bg-primary/20 px-6 py-2.5 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50"
                        >
                          {updateRolesMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                          <span>Confirm Roles Sync</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetEmployee(null)
                            setActiveModal(null)
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
            </AnimatePresence>
          </>
        )}
      </div>
    </>
  )
}
