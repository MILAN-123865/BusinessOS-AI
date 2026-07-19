import { api } from '../services/axios'
import { Project, ProjectMember, ProjectMilestone } from '../types/project'

export const getProjectsApi = async (): Promise<Project[]> => {
  const response = await api.get<{ success: boolean; data: Project[] }>('/projects')
  return response.data.data
}

export const getProjectApi = async (id: string): Promise<Project> => {
  const response = await api.get<{ success: boolean; data: Project }>(`/projects/${id}`)
  return response.data.data
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
