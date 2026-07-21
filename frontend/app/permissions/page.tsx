'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  usePermissions,
  usePermissionModules,
  usePermissionActions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from '@/hooks/usePermissions'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const STANDARD_ACTIONS = [
  'read',
  'create',
  'update',
  'delete',
  'manage',
  'approve',
  'assign',
  'export',
  'import',
]

export default function PermissionsPage() {
  const user = useAuthStore((state) => state.user)
  const { data: permissions = [], isLoading: permsLoading, isError: permsError } = usePermissions()
  const { data: modules = [] } = usePermissionModules()
  const { data: actions = [] } = usePermissionActions()

  const createMutation = useCreatePermission()
  const updateMutation = useUpdatePermission()
  const deleteMutation = useDeletePermission()

  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModule, setSelectedModule] = useState('All')
  const [selectedAction, setSelectedAction] = useState('All')

  // Edit / Create States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPerm, setEditingPerm] = useState<any | null>(null)
  const [permName, setPermName] = useState('')
  const [permDesc, setPermDesc] = useState('')

  // Access Control: Only Superusers/Admins can access this page
  if (user && !user.is_superuser) {
    return (
      <>
        <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center">
          <Lock size={64} className="text-destructive animate-pulse" />
          <h1 className="text-3xl font-bold tracking-tight">Access Control Warning</h1>
          <p className="max-w-md text-muted-foreground">
            You do not possess the necessary scopes (`permissions.manage`) to configure structural security matrix policies.
          </p>
        </div>
      </>
    )
  }

  // Filtered Permissions list
  const filteredPermissions = permissions.filter((perm) => {
    const matchesSearch =
      perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (perm.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesModule = selectedModule === 'All' || perm.module === selectedModule
    const matchesAction = selectedAction === 'All' || perm.action === selectedAction
    return matchesSearch && matchesModule && matchesAction
  })

  // Group permissions for Tree view
  const groupedPermissions: Record<string, any[]> = {}
  filteredPermissions.forEach((perm) => {
    if (!groupedPermissions[perm.module]) {
      groupedPermissions[perm.module] = []
    }
    groupedPermissions[perm.module].push(perm)
  })

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg(null)
    setErrorMsg(null)
    if (!permName) return

    try {
      if (editingPerm) {
        await updateMutation.mutateAsync({
          id: editingPerm.id,
          payload: { description: permDesc },
        })
        setSuccessMsg(`Permission description updated successfully.`)
        setEditingPerm(null)
      } else {
        await createMutation.mutateAsync({
          name: permName,
          description: permDesc || undefined,
        })
        setSuccessMsg(`Permission '${permName}' registered successfully.`)
        setIsCreateOpen(false)
      }
      setPermName('')
      setPermDesc('')
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Operation failed.')
    }
  }

  const handleDeletePerm = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the permission '${name}'?`)) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await deleteMutation.mutateAsync(id)
      setSuccessMsg(`Permission '${name}' deleted successfully.`)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Delete failed.')
    }
  }

  const handleOpenEdit = (perm: any) => {
    setPermName(perm.name)
    setPermDesc(perm.description || '')
    setEditingPerm(perm)
    setIsCreateOpen(false)
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Scope Permission Registry</h1>
            <p className="mt-2 text-muted-foreground">Register and filter system modules capabilities and action contexts.</p>
          </div>
          {!permsLoading && !permsError && (
            <button
              onClick={() => {
                setIsCreateOpen(true)
                setEditingPerm(null)
                setPermName('')
                setPermDesc('')
              }}
              className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all align-self-start"
            >
              <Plus size={16} />
              <span>Register Scope</span>
            </button>
          )}
        </div>

        {/* Banners */}
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

        {permsLoading ? (
          <div className="space-y-6">
            <div className="h-16 rounded-xl bg-card/40 animate-pulse border border-border/40" />
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-60 rounded-xl bg-card/40 animate-pulse border border-border/40" />
              ))}
            </div>
          </div>
        ) : permsError ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle size={48} className="text-destructive animate-bounce" />
            <h3 className="text-xl font-bold text-foreground">API Connection Failure</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Unable to locate the permissions registry. Verify microservice availability.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search & Filters */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/40 bg-card/20 p-4 backdrop-blur-md">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search scopes by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-border/40 bg-background/50 py-2 pl-10 pr-4 text-sm text-foreground outline-none focus:border-accent"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                  >
                    <option value="All">All Modules</option>
                    {modules.map((mod) => (
                      <option key={mod} value={mod}>
                        {mod}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                  >
                    <option value="All">All Actions</option>
                    {actions.map((act) => (
                      <option key={act} value={act}>
                        {act}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Permission Matrix Tree */}
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([moduleName, permList]) => (
                  <Card key={moduleName} className="border-border/40 bg-card/30 backdrop-blur-md">
                    <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-border/20">
                      <div className="flex items-center gap-2">
                        <Shield size={18} className="text-accent" />
                        <CardTitle className="text-sm font-bold capitalize">{moduleName} Scopes</CardTitle>
                      </div>
                      <Badge className="bg-primary/20 text-accent border-0 text-[10px]">
                        {permList.length} Registered
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-border/20">
                      {permList.map((perm) => (
                        <div key={perm.id} className="flex items-center justify-between p-4 text-sm hover:bg-card/25 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{perm.name}</span>
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[9px] capitalize">
                                {perm.action}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {perm.description || 'No operational description mapped.'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenEdit(perm)}
                              className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
                            >
                              Edit
                            </button>
                            {!perm.is_system && (
                              <button
                                onClick={() => handleDeletePerm(perm.id, perm.name)}
                                className="text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Config Form Panel */}
            <div className="lg:col-span-1">
              <AnimatePresence mode="wait">
                {(isCreateOpen || editingPerm) ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-md space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {editingPerm ? `Modify Scope` : 'Register System Scope'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Define modules actions mapping.
                      </p>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Permission Code (name)</label>
                        <input
                          type="text"
                          required
                          disabled={!!editingPerm}
                          value={permName}
                          onChange={(e) => setPermName(e.target.value)}
                          placeholder="e.g. billing.create"
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Description</label>
                        <textarea
                          rows={3}
                          value={permDesc}
                          onChange={(e) => setPermDesc(e.target.value)}
                          placeholder="Allow creating invoice reports."
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={createMutation.isPending || updateMutation.isPending}
                          className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-primary/20 py-2.5 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50"
                        >
                          {(createMutation.isPending || updateMutation.isPending) && (
                            <Loader2 size={16} className="animate-spin" />
                          )}
                          <span>{editingPerm ? 'Update Description' : 'Register Scope'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateOpen(false)
                            setEditingPerm(null)
                          }}
                          className="rounded-xl border border-border/40 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 bg-card/10 text-center p-6">
                    <Shield size={36} className="text-muted-foreground opacity-55" />
                    <h4 className="font-semibold text-foreground mt-3">Permission Scopes</h4>
                    <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
                      Register new granular capability targets, or modify description definitions.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
