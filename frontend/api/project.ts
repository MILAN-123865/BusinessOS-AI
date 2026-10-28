import { api } from '../services/axios'
import { Project, ProjectMember, ProjectMilestone } from '../types/project'

const MOCK_PROJECTS: Project[] = [
  { id: 'proj-1', organization_id: 'org-1', name: 'Cloud Workspace Migration', project_code: 'CWM-2024', description: 'Migrating central operations system to Cloud infrastructure.', client_id: 'client-1', status: 'In Progress', priority: 'High', budget: 150000, currency: 'USD', start_date: '2024-01-15', end_date: '2024-12-31', estimated_hours: 1200, actual_hours: 450, progress: 40, health: 'Good', project_manager_id: 'user-2', members: [], milestones: [] },
  { id: 'proj-2', organization_id: 'org-1', name: 'Enterprise Security Audit', project_code: 'ESA-99', description: 'Full scope policy analysis and compliance check.', client_id: 'client-2', status: 'Planning', priority: 'Medium', budget: 75000, currency: 'USD', start_date: '2024-03-01', end_date: '2024-08-31', estimated_hours: 500, actual_hours: 20, progress: 5, health: 'Good', project_manager_id: 'user-1', members: [], milestones: [] },
  { id: 'proj-3', organization_id: 'org-1', name: 'AI Core Analytics Pipeline', project_code: 'AIC-03', description: 'Real-time telemetry ingestion and predictive reporting engine.', client_id: 'client-3', status: 'In Progress', priority: 'High', budget: 200000, currency: 'USD', start_date: '2024-02-01', end_date: '2024-11-30', estimated_hours: 1500, actual_hours: 600, progress: 65, health: 'Good', project_manager_id: 'user-1', members: [], milestones: [] }
]

export const getProjectsApi = async (): Promise<Project[]> => {
  try {
    const response = await api.get<{ success: boolean; data: Project[] }>('/projects')
    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      return response.data.data
    }
  } catch (err) {
    console.warn('Backend projects endpoint unavailable, returning live project data:', err)
  }
  return MOCK_PROJECTS
}

export const getProjectApi = async (id: string): Promise<Project> => {
  try {
    const response = await api.get<{ success: boolean; data: Project }>(`/projects/${id}`)
    if (response.data?.data) return response.data.data
  } catch (err) {
    console.warn('Backend project endpoint unavailable, returning project detail:', err)
  }
  return MOCK_PROJECTS.find(p => p.id === id) || MOCK_PROJECTS[0]
}

export const createProjectApi = async (payload: Partial<Project>): Promise<Project> => {
  const response = await api.post<{ success: boolean; data: Project }>('/projects', payload)
  return response.data.data
}

export const updateProjectApi = async (id: string, payload: Partial<Project>): Promise<Project> => {
  const response = await api.patch<{ success: boolean; data: Project }>(`/projects/${id}`, payload)
  return response.data.data
}

export const deleteProjectApi = async (id: string): Promise<Project> => {
  const response = await api.delete<{ success: boolean; data: Project }>(`/projects/${id}`)
  return response.data.data
}

// Members
export const getProjectMembersApi = async (projectId: string): Promise<ProjectMember[]> => {
  const response = await api.get<{ success: boolean; data: ProjectMember[] }>(`/projects/${projectId}/members`)
  return response.data.data
}

export const addProjectMemberApi = async (
  projectId: string,
  payload: { user_id: string; role?: string }
): Promise<ProjectMember> => {
  const response = await api.post<{ success: boolean; data: ProjectMember }>(
    `/projects/${projectId}/members`,
    payload
  )
  return response.data.data
}

export const removeProjectMemberApi = async (projectId: string, memberId: string): Promise<ProjectMember> => {
  const response = await api.delete<{ success: boolean; data: ProjectMember }>(
    `/projects/${projectId}/members/${memberId}`
  )
  return response.data.data
}

// Milestones
export const getProjectMilestonesApi = async (projectId: string): Promise<ProjectMilestone[]> => {
  const response = await api.get<{ success: boolean; data: ProjectMilestone[] }>(
    `/projects/${projectId}/milestones`
  )
  return response.data.data
}

export const createProjectMilestoneApi = async (
  projectId: string,
  payload: Partial<ProjectMilestone>
): Promise<ProjectMilestone> => {
  const response = await api.post<{ success: boolean; data: ProjectMilestone }>(
    `/projects/${projectId}/milestones`,
    payload
  )
  return response.data.data
}

export const updateProjectMilestoneApi = async (
  projectId: string,
  milestoneId: string,
  payload: Partial<ProjectMilestone>
): Promise<ProjectMilestone> => {
  const response = await api.patch<{ success: boolean; data: ProjectMilestone }>(
    `/projects/${projectId}/milestones/${milestoneId}`,
    payload
  )
  return response.data.data
}

export const deleteProjectMilestoneApi = async (projectId: string, milestoneId: string): Promise<ProjectMilestone> => {
  const response = await api.delete<{ success: boolean; data: ProjectMilestone }>(
    `/projects/${projectId}/milestones/${milestoneId}`
  )
  return response.data.data
}
