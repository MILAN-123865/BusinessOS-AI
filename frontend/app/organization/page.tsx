'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { useAuthStore } from '@/store/authStore'
import {
  useCurrentOrganization,
  useOrganizations,
  useCreateOrganization,
  useUpdateCurrentOrganization,
  useDeleteOrganization,
} from '@/hooks/useOrganizations'
import {
  useOrganizationDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useOrganizationEmployees,
} from '@/hooks/useDepartments'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  FolderOpen,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const organizationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(150),
  description: z.string().max(1000).optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  contact_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  contact_phone: z.string().max(50).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  postal_code: z.string().max(20).optional().or(z.literal('')),
})

type OrganizationFormValues = z.infer<typeof organizationSchema>

export default function OrganizationPage() {
  const user = useAuthStore((state) => state.user)
  const { data: currentOrg, isLoading: currentOrgLoading, isError: currentOrgError, refetch: refetchCurrent } = useCurrentOrganization()
  const { data: allOrgs = [], isLoading: allOrgsLoading, isError: allOrgsError } = useOrganizations()

  const createMutation = useCreateOrganization()
  const updateMutation = useUpdateCurrentOrganization()
  const deleteMutation = useDeleteOrganization()

  const { data: departments = [], isLoading: depsLoading } = useOrganizationDepartments(currentOrg?.id || '')
  const { data: employees = [] } = useOrganizationEmployees(currentOrg?.id || '')

  const createDepMutation = useCreateDepartment()
  const updateDepMutation = useUpdateDepartment()
  const deleteDepMutation = useDeleteDepartment()

  const [editingDep, setEditingDep] = useState<any | null>(null)
  const [isDepCreateOpen, setIsDepCreateOpen] = useState(false)

  const [activeTab, setActiveTab] = useState<'profile' | 'all' | 'departments'>('profile')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      website: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
    },
  })

  // Load defaults on fetch success
  useEffect(() => {
    if (currentOrg) {
      reset({
        name: currentOrg.name,
        slug: currentOrg.slug,
        description: currentOrg.description || '',
        website: currentOrg.website || '',
        contact_email: currentOrg.contact_email || '',
        contact_phone: currentOrg.contact_phone || '',
        address: currentOrg.address || '',
        city: currentOrg.city || '',
        state: currentOrg.state || '',
        country: currentOrg.country || '',
        postal_code: currentOrg.postal_code || '',
      })
    }
  }, [currentOrg, reset])

  const onSubmitProfile = async (data: OrganizationFormValues) => {
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await updateMutation.mutateAsync(data)
      setSuccessMsg('Organization profile updated successfully.')
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update organization details.')
    }
  }

  // Create Organization Form State
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgSlug, setNewOrgSlug] = useState('')

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName || !newOrgSlug) return
    try {
      await createMutation.mutateAsync({ name: newOrgName, slug: newOrgSlug })
      setSuccessMsg(`Organization '${newOrgName}' created successfully.`)
      setNewOrgName('')
      setNewOrgSlug('')
      setIsCreateOpen(false)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to create organization.')
    }
  }

  const handleDeleteOrg = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization tenant? This action is irreversible.')) return
    try {
      await deleteMutation.mutateAsync(id)
      setSuccessMsg('Organization deleted successfully.')
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to delete organization.')
    }
  }

  const isLoading = currentOrgLoading || (user?.is_superuser && allOrgsLoading)

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Organization Workstation</h1>
            <p className="mt-2 text-muted-foreground">Manage organization profile, branches, and tenant spaces.</p>
          </div>
          {currentOrgError && (
            <button
              onClick={() => refetchCurrent()}
              className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20 transition-all"
            >
              Retry Connection
            </button>
          )}
        </div>

        {/* Success/Error Banners */}
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

        {isLoading ? (
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-card/40 animate-pulse border border-border/40" />
              ))}
            </div>
            <div className="h-96 rounded-xl bg-card/40 animate-pulse border border-border/40" />
          </div>
        ) : currentOrgError ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle size={48} className="text-destructive animate-bounce" />
            <h3 className="text-xl font-bold text-foreground">API Connection Failure</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Unable to locate organization data. Check backend workspace deployment.
            </p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid gap-6 sm:grid-cols-3">
              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Departments</p>
                    <p className="text-3xl font-bold">4</p>
                  </div>
                  <div className="rounded-lg bg-primary/20 p-3">
                    <Building2 size={24} className="text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Active Employees</p>
                    <p className="text-3xl font-bold">{currentOrg?.is_active ? 1 : 0}</p>
                  </div>
                  <div className="rounded-lg bg-primary/20 p-3">
                    <Users size={24} className="text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Platform Tenant Status</p>
                    <div className="pt-1">
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-0">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-lg bg-primary/20 p-3">
                    <CheckCircle size={24} className="text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border/40">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 font-semibold border-b-2 text-sm transition-all ${
                  activeTab === 'profile'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Profile & Tenant Details
              </button>
              <button
                onClick={() => setActiveTab('departments')}
                className={`px-6 py-3 font-semibold border-b-2 text-sm transition-all ${
                  activeTab === 'departments'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Departments
              </button>
              {user?.is_superuser && (
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-6 py-3 font-semibold border-b-2 text-sm transition-all ${
                    activeTab === 'all'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Tenants Administration
                </button>
              )}
            </div>

            {/* Active Tab View */}
            <div>
              {activeTab === 'profile' && (
                <div className="rounded-2xl border border-border/40 bg-card/30 p-8 backdrop-blur-md">
                  <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
                    <h3 className="text-xl font-semibold border-b border-border/40 pb-4">Corporate Settings</h3>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Organization Name</label>
                        <input
                          type="text"
                          {...register('name')}
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-foreground outline-none focus:border-accent"
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Slug (Internal URL Tag)</label>
                        <input
                          type="text"
                          {...register('slug')}
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-foreground outline-none focus:border-accent"
                        />
                        {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <textarea
                        {...register('description')}
                        rows={3}
                        className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-foreground outline-none focus:border-accent"
                      />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Website Link</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            <Globe size={16} />
                          </span>
                          <input
                            type="text"
                            {...register('website')}
                            placeholder="https://company.com"
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 pl-10 text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            <Mail size={16} />
                          </span>
                          <input
                            type="text"
                            {...register('contact_email')}
                            placeholder="info@company.com"
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 pl-10 text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        {errors.contact_email && <p className="text-xs text-destructive">{errors.contact_email.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Contact Phone</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            <Phone size={16} />
                          </span>
                          <input
                            type="text"
                            {...register('contact_phone')}
                            placeholder="+1 (555) 000-0000"
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 pl-10 text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        {errors.contact_phone && <p className="text-xs text-destructive">{errors.contact_phone.message}</p>}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold border-b border-border/40 pt-4 pb-2">Postal Address</h3>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Street Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <MapPin size={16} />
                        </span>
                        <input
                          type="text"
                          {...register('address')}
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 pl-10 text-foreground outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">City</label>
                        <input
                          type="text"
                          {...register('city')}
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-foreground outline-none focus:border-accent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">State / Region</label>
                        <input
                          type="text"
                          {...register('state')}
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-foreground outline-none focus:border-accent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Country</label>
                        <input
                          type="text"
                          {...register('country')}
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-foreground outline-none focus:border-accent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Postal Code</label>
                        <input
                          type="text"
                          {...register('postal_code')}
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-foreground outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="flex items-center justify-center gap-2 rounded-xl bg-primary/20 px-6 py-2.5 font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50"
                      >
                        {updateMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                        <span>Save Workspace Changes</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}


              {activeTab === 'departments' && (
                <div className="space-y-6">
                  {/* Title & Add Department Button */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-foreground">Departments</h3>
                    <button
                      onClick={() => {
                        setIsDepCreateOpen(true)
                        setEditingDep(null)
                      }}
                      className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all"
                    >
                      <Plus size={16} />
                      <span>Add Department</span>
                    </button>
                  </div>

                  {/* Create / Edit Department Card Form */}
                  {(isDepCreateOpen || editingDep) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-md space-y-4"
                    >
                      <h4 className="font-semibold text-foreground">
                        {editingDep ? 'Edit Department Details' : 'New Department Specification'}
                      </h4>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault()
                          setSuccessMsg(null)
                          setErrorMsg(null)
                          const formData = new FormData(e.currentTarget)
                          const name = formData.get('dep_name') as string
                          const code = formData.get('dep_code') as string
                          const description = formData.get('dep_desc') as string
                          const manager_id = formData.get('dep_manager') as string

                          if (!name) return

                          try {
                            if (editingDep) {
                              await updateDepMutation.mutateAsync({
                                id: editingDep.id,
                                payload: {
                                  name,
                                  code: code || undefined,
                                  description: description || undefined,
                                  manager_id: manager_id || undefined,
                                },
                              })
                              setSuccessMsg(`Department '${name}' updated successfully.`)
                              setEditingDep(null)
                            } else {
                              await createDepMutation.mutateAsync({
                                organization_id: currentOrg?.id || '',
                                name,
                                code: code || undefined,
                                description: description || undefined,
                                manager_id: manager_id || undefined,
                              })
                              setSuccessMsg(`Department '${name}' created successfully.`)
                              setIsDepCreateOpen(false)
                            }
                          } catch (err: any) {
                            setErrorMsg(err.response?.data?.detail || 'Operation failed.')
                          }
                        }}
                        className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 items-end"
                      >
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">Department Name</label>
                          <input
                            type="text"
                            name="dep_name"
                            required
                            defaultValue={editingDep?.name || ''}
                            placeholder="Engineering"
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">Department Code</label>
                          <input
                            type="text"
                            name="dep_code"
                            defaultValue={editingDep?.code || ''}
                            placeholder="ENG"
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">Assign Manager</label>
                          <select
                            name="dep_manager"
                            defaultValue={editingDep?.manager_id || ''}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          >
                            <option value="">No Manager Assigned</option>
                            {employees.map((emp: any) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">Description</label>
                          <input
                            type="text"
                            name="dep_desc"
                            defaultValue={editingDep?.description || ''}
                            placeholder="Core engineering team"
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="flex gap-2 md:col-span-4 justify-end pt-2">
                          <button
                            type="submit"
                            disabled={createDepMutation.isPending || updateDepMutation.isPending}
                            className="flex justify-center items-center gap-2 rounded-xl bg-primary/20 px-6 py-2 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50"
                          >
                            {(createDepMutation.isPending || updateDepMutation.isPending) && (
                              <Loader2 size={16} className="animate-spin" />
                            )}
                            <span>{editingDep ? 'Save Changes' : 'Create Department'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsDepCreateOpen(false)
                              setEditingDep(null)
                            }}
                            className="rounded-xl border border-border/40 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* Departments Grid */}
                  {depsLoading ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-40 rounded-xl bg-card/40 animate-pulse border border-border/40" />
                      ))}
                    </div>
                  ) : departments.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      {departments.map((dep) => (
                        <Card key={dep.id} className="border-border/40 bg-card/30 backdrop-blur-md hover:shadow-lg transition-all">
                          <CardHeader className="flex flex-row items-start justify-between p-6 pb-2">
                            <div>
                              <CardTitle className="text-lg font-bold">{dep.name}</CardTitle>
                              {dep.code && (
                                <CardDescription className="text-xs font-semibold font-mono text-muted-foreground">
                                  Code: {dep.code}
                                </CardDescription>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingDep(dep)
                                  setIsDepCreateOpen(false)
                                }}
                                className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={async () => {
                                  if (
                                    confirm(`Are you sure you want to delete the department '${dep.name}'?`)
                                  ) {
                                    try {
                                      await deleteDepMutation.mutateAsync(dep.id)
                                      setSuccessMsg('Department deleted successfully.')
                                    } catch (err: any) {
                                      setErrorMsg(err.response?.data?.detail || 'Delete failed.')
                                    }
                                  }
                                }}
                                className="rounded-lg p-1 text-muted-foreground hover:text-destructive transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </CardHeader>
                          <CardContent className="px-6 pb-6 pt-2 text-sm text-muted-foreground space-y-3">
                            <p className="text-xs">
                              {dep.description || 'No department description configured.'}
                            </p>
                            <div className="pt-2 border-t border-border/20 flex justify-between items-center text-xs">
                              <span>
                                Manager:{' '}
                                <span className="font-semibold text-foreground">
                                  {dep.manager
                                    ? `${dep.manager.first_name} ${dep.manager.last_name}`
                                    : 'None Assigned'}
                                </span>
                              </span>
                              <Badge className="bg-primary/10 text-accent border-0">
                                Active
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-border/40 bg-card/10 text-muted-foreground">
                      <Building2 size={32} className="opacity-55" />
                      <span className="text-sm mt-2 font-medium">No departments provisioned for this organization.</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'all' && user?.is_superuser && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Registered Tenancy Clusters</h3>
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all"
                    >
                      <Plus size={16} />
                      <span>Provision Tenant</span>
                    </button>
                  </div>

                  {/* Create Tenant Form / Card */}
                  {isCreateOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-md space-y-4"
                    >
                      <h4 className="font-semibold text-foreground">New Tenancy Specification</h4>
                      <form onSubmit={handleCreateOrg} className="grid gap-4 sm:grid-cols-3 items-end">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">Tenant Name</label>
                          <input
                            type="text"
                            required
                            value={newOrgName}
                            onChange={(e) => setNewOrgName(e.target.value)}
                            placeholder="Acme Corp"
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">Unique Slug Indicator</label>
                          <input
                            type="text"
                            required
                            value={newOrgSlug}
                            onChange={(e) => setNewOrgSlug(e.target.value)}
                            placeholder="acme-corp"
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-primary/20 py-2.5 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50"
                          >
                            {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                            <span>Provision</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                            className="rounded-xl border border-border/40 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* Tenants List Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {allOrgs.map((org) => (
                      <Card key={org.id} className="border-border/40 bg-card/30 backdrop-blur-md hover:shadow-lg transition-all">
                        <CardHeader className="flex flex-row items-start justify-between p-6 pb-2">
                          <div>
                            <CardTitle className="text-lg font-bold">{org.name}</CardTitle>
                            <CardDescription className="text-xs font-semibold font-mono text-muted-foreground">
                              {org.slug}
                            </CardDescription>
                          </div>
                          <button
                            onClick={() => handleDeleteOrg(org.id)}
                            title="Delete Tenant"
                            className="rounded-lg p-1.5 hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 pt-2 text-sm text-muted-foreground space-y-3">
                          <p className="line-clamp-2 text-xs">
                            {org.description || 'No organization description configured.'}
                          </p>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs pt-2">
                            <span className="flex items-center gap-1.5">
                              <Globe size={14} />
                              <span className="truncate max-w-[150px]">{org.website || 'N/A'}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Mail size={14} />
                              <span className="truncate max-w-[150px]">{org.contact_email || 'N/A'}</span>
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
