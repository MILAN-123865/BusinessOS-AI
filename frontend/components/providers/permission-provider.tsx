'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'

interface PermissionContextType {
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  canCreate: (module: string) => boolean
  canUpdate: (module: string) => boolean
  canDelete: (module: string) => boolean
  canManage: (module: string) => boolean
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

export function PermissionProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.is_superuser) return true
    return user.permissions?.includes(permission) || false
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false
    if (user.is_superuser) return true
    return permissions.some((perm) => user.permissions?.includes(perm))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false
    if (user.is_superuser) return true
    return permissions.every((perm) => user.permissions?.includes(perm))
  }

  const canCreate = (module: string): boolean => {
    return hasPermission(`${module}.manage`) || hasPermission(`${module}.create`)
  }

  const canUpdate = (module: string): boolean => {
    return hasPermission(`${module}.manage`) || hasPermission(`${module}.update`)
  }

  const canDelete = (module: string): boolean => {
    return hasPermission(`${module}.manage`) || hasPermission(`${module}.delete`)
  }

  const canManage = (module: string): boolean => {
    return hasPermission(`${module}.manage`)
  }

  return (
    <PermissionContext.Provider
      value={{
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canCreate,
        canUpdate,
        canDelete,
        canManage,
      }}
    >
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermission() {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider')
  }
  return context
}

export function useCan(action: string, module: string) {
  const { hasPermission } = usePermission()
  return hasPermission(`${module}.${action}`) || hasPermission(`${module}.manage`)
}
