export type PermissionAction = 'read' | 'manage' | 'create' | 'update' | 'delete' | 'export'

export interface PermissionDefinition {
  id: string
  name: string
  module: string
  action: string
  description: string
}

export interface SimulatedRoleProfile {
  id: string
  name: string
  badgeColor: string
  tagline: string
  description: string
  isSuperuser: boolean
  clearanceLevel: 'Tier 1 - Full Enterprise Admin' | 'Tier 2 - Department Executive' | 'Tier 3 - Operational Lead' | 'Tier 4 - Standard Member' | 'Tier 5 - Restricted Guest'
  avatar: string
  permissions: string[]
}

export const ALL_SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  { id: 'perm-1', name: 'dashboard.read', module: 'dashboard', action: 'read', description: 'Access to view dashboard metrics and KPI widgets' },
  { id: 'perm-2', name: 'organization.read', module: 'organization', action: 'read', description: 'Access to view organization profile and tenant settings' },
  { id: 'perm-3', name: 'organization.manage', module: 'organization', action: 'manage', description: 'Access to update company info, domains, and global configuration' },
  { id: 'perm-4', name: 'departments.read', module: 'departments', action: 'read', description: 'Access to view department hierarchy and headcounts' },
  { id: 'perm-5', name: 'departments.manage', module: 'departments', action: 'manage', description: 'Access to create, update, and restructure departments' },
  { id: 'perm-6', name: 'employees.read', module: 'employees', action: 'read', description: 'Access to view employee directory and staff profiles' },
  { id: 'perm-7', name: 'employees.manage', module: 'employees', action: 'manage', description: 'Access to hire, edit, invite, and deactivate team members' },
  { id: 'perm-8', name: 'roles.read', module: 'roles', action: 'read', description: 'Access to inspect workspace security roles and assignments' },
  { id: 'perm-9', name: 'roles.manage', module: 'roles', action: 'manage', description: 'Access to create custom roles and assign security policies' },
  { id: 'perm-10', name: 'permissions.read', module: 'permissions', action: 'read', description: 'Access to view granular system permission matrices' },
  { id: 'perm-11', name: 'permissions.manage', module: 'permissions', action: 'manage', description: 'Access to modify permission grants and security levels' },
  { id: 'perm-12', name: 'projects.read', module: 'projects', action: 'read', description: 'Access to view project roadmaps, budgets, and milestones' },
  { id: 'perm-13', name: 'projects.manage', module: 'projects', action: 'manage', description: 'Access to create, budget, and archive workspace projects' },
  { id: 'perm-14', name: 'clients.read', module: 'clients', action: 'read', description: 'Access to view client accounts and customer directories' },
  { id: 'perm-15', name: 'clients.manage', module: 'clients', action: 'manage', description: 'Access to manage enterprise accounts and CRM contacts' },
  { id: 'perm-16', name: 'documents.read', module: 'documents', action: 'read', description: 'Access to search and download workspace documents' },
  { id: 'perm-17', name: 'documents.manage', module: 'documents', action: 'manage', description: 'Access to upload, version, and delete company files' },
]

export const PRESET_SIMULATED_ROLES: SimulatedRoleProfile[] = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    tagline: 'Unrestricted root clearance with full system & tenant authority',
    description: 'Possesses all 17 system permissions. Can manage security, access raw database SQL, invite users, and alter enterprise settings.',
    isSuperuser: true,
    clearanceLevel: 'Tier 1 - Full Enterprise Admin',
    avatar: '👑',
    permissions: ALL_SYSTEM_PERMISSIONS.map(p => p.name)
  },
  {
    id: 'sales_executive',
    name: 'Sales & Client Executive',
    badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    tagline: 'Customer relationship management & commerce portfolio lead',
    description: 'Manages enterprise clients, CRM accounts, projects, and documents. Restricted from employee records, user management, and security roles.',
    isSuperuser: false,
    clearanceLevel: 'Tier 2 - Department Executive',
    avatar: '💼',
    permissions: [
      'dashboard.read',
      'clients.read',
      'clients.manage',
      'projects.read',
      'projects.manage',
      'documents.read',
      'documents.manage',
      'organization.read'
    ]
  },
  {
    id: 'hr_manager',
    name: 'HR & Operations Director',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    tagline: 'People operations, organizational hierarchy & staffing lead',
    description: 'Manages employee directory, departments, organizational structure, and documents. Restricted from client CRM and security role policies.',
    isSuperuser: false,
    clearanceLevel: 'Tier 2 - Department Executive',
    avatar: '👥',
    permissions: [
      'dashboard.read',
      'organization.read',
      'departments.read',
      'departments.manage',
      'employees.read',
      'employees.manage',
      'documents.read',
      'documents.manage'
    ]
  },
  {
    id: 'project_lead',
    name: 'Technical Project Lead',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    tagline: 'Engineering delivery, roadmap execution & sprint coordination',
    description: 'Controls projects, tasks, workflows, and technical documents. Read-only on team members; restricted from tenant & role administration.',
    isSuperuser: false,
    clearanceLevel: 'Tier 3 - Operational Lead',
    avatar: '🚀',
    permissions: [
      'dashboard.read',
      'projects.read',
      'projects.manage',
      'documents.read',
      'documents.manage',
      'employees.read',
      'departments.read'
    ]
  },
  {
    id: 'auditor_guest',
    name: 'Read-Only Auditor / Guest',
    badgeColor: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    tagline: 'Compliance observer with view-only inspection access',
    description: 'Strictly read-only access to dashboard and documents. All mutating actions (create, update, delete, role configuration) are blocked.',
    isSuperuser: false,
    clearanceLevel: 'Tier 5 - Restricted Guest',
    avatar: '👁️',
    permissions: [
      'dashboard.read',
      'organization.read',
      'documents.read'
    ]
  }
]
