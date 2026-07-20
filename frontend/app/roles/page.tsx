'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { useAuthStore } from '@/store/authStore'
import {
  useRoles,
  usePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from '@/hooks/useRoles'
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
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function RolesPage() {
  const user = useAuthStore((state) => state.user)
  const { data: roles = [], isLoading: rolesLoading, isError: rolesError } = useRoles()
  const { data: permissions = [], isLoading: permsLoading } = usePermissions()

  const createMutation = useCreateRole()
  const updateMutation = useUpdateRole()
  const deleteMutation = useDeleteRole()

  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Dialog & Edit State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any | null>(null)
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([])
  const [collapsedModules, setCollapsedModules] = useState<string[]>([])

  // Form inputs
  const [roleName, setRoleName] = useState('')
  const [roleDesc, setRoleDesc] = useState('')

  // Access Control: Only Superusers (Admins) can manage roles in this tenant space
  if (user && !user.is_superuser) {
    return (
      <AppLayout>
        <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center">
          <Lock size={64} className="text-destructive animate-pulse" />
          <h1 className="text-3xl font-bold tracking-tight">Access Control Warning</h1>
          <p className="max-w-md text-muted-foreground">
            You do not possess the necessary policies (`roles.manage`) to access the tenant Role-Based Access Control configuration workstation.
          </p>
        </div>
      </AppLayout>
    )
  }

  // Helper to group permissions by module category
  const groupedPermissions: Record<string, any[]> = {}
  permissions.forEach((perm) => {
    const parts = perm.name.split('.')
    const moduleName = parts.length > 1 ? parts[0] : 'General'
    if (!groupedPermissions[moduleName]) {
      groupedPermissions[moduleName] = []
    }
    groupedPermissions[moduleName].push(perm)
  })

  const toggleModuleCollapse = (moduleName: string) => {
    setCollapsedModules((prev) =>
      prev.includes(moduleName) ? prev.filter((m) => m !== moduleName) : [...prev, moduleName]
    )
  }

  const togglePermission = (permId: string) => {
    setSelectedPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    )
  }

  const handleSelectAllModule = (moduleName: string, permList: any[]) => {
    const permIds = permList.map((p) => p.id)
    const allSelected = permIds.every((id) => selectedPermIds.includes(id))

    if (allSelected) {
      setSelectedPermIds((prev) => prev.filter((id) => !permIds.includes(id)))
    } else {
      setSelectedPermIds((prev) => [...new Set([...prev, ...permIds])])
    }
  }

  const handleOpenCreate = () => {
    setRoleName('')
    setRoleDesc('')
    setSelectedPermIds([])
    setIsCreateOpen(true)
    setEditingRole(null)
  }

  const handleOpenEdit = (role: any) => {
    setRoleName(role.name)
    setRoleDesc(role.description || '')
    setSelectedPermIds(role.permissions.map((p: any) => p.id))
    setEditingRole(role)
    setIsCreateOpen(false)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg(null)
    setErrorMsg(null)
    if (!roleName) return

    try {
      if (editingRole) {
        await updateMutation.mutateAsync({
          id: editingRole.id,
          payload: {
            name: roleName,
            description: roleDesc || undefined,
            permission_ids: selectedPermIds,
          },
        })
        setSuccessMsg(`Role '${roleName}' updated successfully.`)
        setEditingRole(null)
      } else {
        await createMutation.mutateAsync({
          name: roleName,
          description: roleDesc || undefined,
          permission_ids: selectedPermIds,
        })
        setSuccessMsg(`Role '${roleName}' created successfully.`)
        setIsCreateOpen(false)
      }
      setRoleName('')
      setRoleDesc('')
      setSelectedPermIds([])
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Operation failed.')
    }
  }

  const handleDeleteRole = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the role '${name}'? This action cannot be undone.`)) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await deleteMutation.mutateAsync(id)
      setSuccessMsg(`Role '${name}' deleted successfully.`)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to delete role.')
    }
  }

  const isLoading = rolesLoading || permsLoading

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Roles & RBAC Policies</h1>
            <p className="mt-2 text-muted-foreground">Manage user permissions and security policies across your tenant spaces.</p>
          </div>
          {!isLoading && !rolesError && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all align-self-start md:align-self-auto"
            >
              <Plus size={16} />
              <span>Create Custom Role</span>
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

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-card/40 animate-pulse border border-border/40" />
            ))}
          </div>
        ) : rolesError ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle size={48} className="text-destructive animate-bounce" />
            <h3 className="text-xl font-bold text-foreground">API Connection Failure</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Unable to reach the role management microservices. Verify API router settings.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Roles List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {roles.map((role) => (
                  <Card
                    key={role.id}
                    className={`border-border/40 bg-card/30 backdrop-blur-md hover:shadow-lg transition-all ${
                      editingRole?.id === role.id ? 'border-accent ring-1 ring-accent' : ''
                    }`}
                  >
                    <CardHeader className="flex flex-row items-start justify-between p-6 pb-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg font-bold">{role.name}</CardTitle>
                          {role.is_system && (
                            <Badge className="bg-primary/20 text-accent hover:bg-primary/30 border-0 text-[10px]">
                              System
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-semibold">
                          {role.permissions.length} Associated Policies
                        </p>
                      </div>
                      {!role.is_system && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleOpenEdit(role)}
                            className="rounded-lg p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-accent transition-all"
                            title="Edit Role"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id, role.name)}
                            disabled={role.user_count > 0}
                            className="rounded-lg p-1.5 hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-all disabled:opacity-30"
                            title={role.user_count > 0 ? "Cannot delete role while users are assigned" : "Delete Role"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-2 text-sm text-muted-foreground space-y-3">
                      <p className="text-xs line-clamp-2">
                        {role.description || 'No role description provided.'}
                      </p>
                      <div className="pt-2 border-t border-border/20 flex justify-between items-center text-xs">
                        <span>
                          Assigned Users: <span className="font-bold text-foreground">{role.user_count}</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(role.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Create/Edit Panel Form */}
            <div className="lg:col-span-1">
              <AnimatePresence mode="wait">
                {(isCreateOpen || editingRole) ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-md space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {editingRole ? `Modify ${editingRole.name}` : 'Provision Custom Role'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Define specifications and map RBAC scopes.
                      </p>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Role Display Name</label>
                        <input
                          type="text"
                          required
                          value={roleName}
                          onChange={(e) => setRoleName(e.target.value)}
                          placeholder="e.g. Finance Admin"
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Description</label>
                        <textarea
                          rows={2}
                          value={roleDesc}
                          onChange={(e) => setRoleDesc(e.target.value)}
                          placeholder="Assign billing and financial overview permissions."
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                        />
                      </div>

                      {/* Permission Tree Selector */}
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-muted-foreground block">
                          Associated Scope Policies ({selectedPermIds.length} Selected)
                        </label>
                        <div className="max-h-[300px] overflow-y-auto rounded-xl border border-border/40 bg-background/30 p-3 space-y-2 divide-y divide-border/20">
                          {Object.entries(groupedPermissions).map(([moduleName, permList]) => {
                            const isCollapsed = collapsedModules.includes(moduleName)
                            const modulePermIds = permList.map((p) => p.id)
                            const allSelected = modulePermIds.every((id) => selectedPermIds.includes(id))
                            const someSelected = modulePermIds.some((id) => selectedPermIds.includes(id)) && !allSelected

                            return (
                              <div key={moduleName} className="pt-2 first:pt-0 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={allSelected}
                                      ref={(el) => {
                                        if (el) el.indeterminate = someSelected
                                      }}
                                      onChange={() => handleSelectAllModule(moduleName, permList)}
                                      className="rounded border-border/40 text-accent focus:ring-accent"
                                    />
                                    <span className="text-xs font-bold capitalize text-foreground">{moduleName}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => toggleModuleCollapse(moduleName)}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                  </button>
                                </div>

                                {!isCollapsed && (
                                  <div className="pl-6 grid gap-2">
                                    {permList.map((perm) => {
                                      const isChecked = selectedPermIds.includes(perm.id)
                                      return (
                                        <label key={perm.id} className="flex items-start gap-2 cursor-pointer select-none">
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => togglePermission(perm.id)}
                                            className="mt-0.5 rounded border-border/40 text-accent focus:ring-accent"
                                          />
                                          <div className="text-[11px] leading-tight">
                                            <p className="font-semibold text-foreground">{perm.name.split('.')[1] || perm.name}</p>
                                            <p className="text-muted-foreground text-[10px]">{perm.description}</p>
                                          </div>
                                        </label>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
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
                          <span>{editingRole ? 'Update Role' : 'Provision'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreateOpen(false)
                            setEditingRole(null)
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
                    <h4 className="font-semibold text-foreground mt-3">Configure Policies</h4>
                    <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
                      Select a role to modify policies, or create a new custom role to grant scopes.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
