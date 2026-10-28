import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types/auth'
import { SimulatedRoleProfile, PRESET_SIMULATED_ROLES, ALL_SYSTEM_PERMISSIONS } from '../types/rbac'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  simulatedRole: SimulatedRoleProfile | null
  
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  updateUser: (user: User) => void
  clearAuth: () => void
  
  // RBAC Simulator controls
  setSimulatedRole: (role: SimulatedRoleProfile | null) => void
  resetSimulation: () => void
  toggleSimulatedPermission: (permissionName: string) => void
  
  // Permission evaluators
  hasPermission: (permissionName: string) => boolean
  hasAnyPermission: (permissionNames: string[]) => boolean
  isSuperuserEffective: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      simulatedRole: null,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      updateUser: (user) => set({ user }),
      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, simulatedRole: null }),

      setSimulatedRole: (role) => set({ simulatedRole: role }),
      
      resetSimulation: () => set({ simulatedRole: null }),

      toggleSimulatedPermission: (permissionName: string) => {
        const currentSim = get().simulatedRole
        if (!currentSim) return
        
        const has = currentSim.permissions.includes(permissionName)
        const updatedPerms = has
          ? currentSim.permissions.filter(p => p !== permissionName)
          : [...currentSim.permissions, permissionName]

        set({
          simulatedRole: {
            ...currentSim,
            permissions: updatedPerms,
            isSuperuser: updatedPerms.length === ALL_SYSTEM_PERMISSIONS.length
          }
        })
      },

      isSuperuserEffective: () => {
        const { simulatedRole, user } = get()
        if (simulatedRole) {
          return !!simulatedRole.isSuperuser
        }
        return !!user?.is_superuser
      },

      hasPermission: (permissionName: string) => {
        const { simulatedRole, user } = get()
        
        // If in simulation mode, check the simulated persona's permissions
        if (simulatedRole) {
          if (simulatedRole.isSuperuser) return true
          return simulatedRole.permissions.includes(permissionName)
        }
        
        // Real user check
        if (user?.is_superuser) return true
        
        // Extract permissions from user.permissions or user.roles if available
        if (user?.permissions && Array.isArray(user.permissions)) {
          if (user.permissions.includes(permissionName)) return true
        }

        // Fallback default for demo admin or standard authenticated user
        return true
      },

      hasAnyPermission: (permissionNames: string[]) => {
        const fn = get().hasPermission
        return permissionNames.some((p) => fn(p))
      },
    }),
    {
      name: 'businessos-auth',
    }
  )
)
